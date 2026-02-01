import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Row, Col, Spin, Radio, Alert, Divider, Typography, Tag, Checkbox } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { TASK_STATUS, TASK_PRIORITY, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from './types';
import * as userService from '../../../service/userService';
import * as costingService from '../../../service/costingService';
import * as taskService from '../../../service/taskService';
import * as customerService from '../../../service/customerService';
import { UserOutlined, DollarOutlined, BookOutlined, ShoppingOutlined, PhoneOutlined, HomeOutlined, ContainerOutlined, TruckOutlined, SettingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// Helper function to get current user ID from sessionStorage
const getCurrentUserId = () => {
  try {
    const authUser = sessionStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.user?._id || user.user?.id || user._id || user.id || null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
};

const AddTaskModal = ({ visible, onCancel, onOk, phaseId, initialValues, template: templateProp }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [costings, setCostings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCostings, setLoadingCostings] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [taskTemplate, setTaskTemplate] = useState(null);

  // Use template prop if provided, otherwise fall back to loading
  const currentTemplate = templateProp || taskTemplate;
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [costingSearchTerm, setCostingSearchTerm] = useState('');
  const [selectedCosting, setSelectedCosting] = useState(null);
  const [batchSizes, setBatchSizes] = useState([]);
  const [selectedBatchRawMaterials, setSelectedBatchRawMaterials] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const userSearchTimeoutRef = useRef(null);
  const costingSearchTimeoutRef = useRef(null);
  const customerSearchTimeoutRef = useRef(null);

  const { Text } = Typography;

  // Check if this is the Filling & Packing phase (legacy check)
  // Now we use optionalFields from template instead
  const isFillingAndPackingPhase = currentTemplate?.isFillingAndPacking === true;

  // Get optional fields from template
  const optionalFields = currentTemplate?.optionalFields || [];
  const optionalFieldConfig = currentTemplate?.optionalFieldConfig || {};

  // Dynamic validation schema - updates when template loads
  // According to API docs, these are ALWAYS REQUIRED: task, phaseId, status, assignedUserId, priority, startDate, dueDate
  const validationSchema = React.useMemo(() => {
    const baseSchema = {
      task: Yup.string().required('Task title is required').max(512, 'Task title must be 512 characters or less'),
      phaseId: Yup.string().required('Phase is required'),
      status: Yup.string().required('Status is required'),
      assignedUserId: Yup.string().required('Assign To is required'),
      priority: Yup.string().oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority').required('Priority is required'),
      startDate: Yup.date().required('Start Date is required').nullable(),
      dueDate: Yup.date()
        .required('Due Date is required')
        .nullable()
        .test('is-after-start', 'Due Date must be after or equal to Start Date', function (value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true; // Let required validation handle empty values
          const dueDateValue = dayjs(value);
          const startDateValue = dayjs(startDate);
          // Check if dueDate is same day or after startDate
          return dueDateValue.isAfter(startDateValue, 'day') || dueDateValue.isSame(startDateValue, 'day');
        }),
    };

    // Add validation for optional fields based on template
    if (currentTemplate?.optionalFields) {
      currentTemplate.optionalFields.forEach(fieldKey => {
        const fieldConfig = optionalFieldConfig[fieldKey];
        if (fieldConfig) {
          switch (fieldKey) {
            case 'orderNumber':
              baseSchema.orderNumber = Yup.string().required('Order number is required');
              break;
            case 'customerName':
              baseSchema.customerName = Yup.string().required('Customer name is required');
              break;
            case 'customerContact':
            case 'customerMobile':
              baseSchema.customerMobile = Yup.string()
                .required('Customer mobile number is required')
                .matches(/^(\+?94|0)?[0-9]{9}$/, 'Invalid mobile number format. Must be valid (e.g., +94771234567, 0771234567)');
              break;
            case 'customerAddress':
              baseSchema.customerAddress = Yup.string().required('Customer address is required');
              break;
            case 'costedProduct':
              baseSchema.costingId = Yup.string().required('Costed product is required');
              break;
            case 'batchSizeRatio':
              baseSchema.batchSize = Yup.string().required('Batch size ratio is required');
              break;
            case 'courierNumber':
              baseSchema.courierNumber = Yup.string().nullable();
              break;
            case 'courierService':
              baseSchema.courierService = Yup.string().required('Courier service is required');
              break;
          }
        }
      });
    }

    // Legacy: Add Filling & Packing phase fields if template indicates it
    if (currentTemplate?.isFillingAndPacking) {
      baseSchema.orderNumber = Yup.string().required('Order number is required');
      baseSchema.customerName = Yup.string().required('Customer name is required');
      baseSchema.customerMobile = Yup.string()
        .required('Customer mobile number is required')
        .matches(/^(\+?94|0)?[0-9]{9}$/, 'Invalid mobile number format. Must be valid (e.g., +94771234567, 0771234567)');
      baseSchema.customerAddress = Yup.string().required('Customer address is required');
    }

    return Yup.object(baseSchema);
  }, [currentTemplate, optionalFieldConfig]);

  // Initialize formik first (before any useEffect that depends on it)
  const formik = useFormik({
    initialValues: initialValues || {
      task: '',
      description: '',
      startDate: null,
      dueDate: null,
      status: TASK_STATUS.PENDING,
      priority: TASK_PRIORITY.MEDIUM,
      phaseId: phaseId || '',
      order: 0,
      comments: 0,
      views: 0,
      assignedUserId: null,
      costingId: null,
      batchSize: null,
      // Filling & Packing phase specific fields
      orderNumber: '',
      customerName: '',
      customerMobile: '',
      customerAddress: '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Get the current template at submit time (use latest template)
      const submitTemplate = templateProp || taskTemplate;
      const submitOptionalFields = submitTemplate?.optionalFields || [];

      console.log('Submit - Current Template:', submitTemplate);
      console.log('Submit - Optional Fields:', submitOptionalFields);

      // Prepare task data according to API requirements (POST /tasks)
      // Required fields according to API docs: task, phaseId, status, assignedUserId, priority, startDate, dueDate
      // These fields are validated by Yup schema, so they should always have values
      const taskData = {
        task: values.task,
        phaseId: values.phaseId,
        status: values.status,
        assignedUserId: values.assignedUserId,
        priority: values.priority,
        startDate: dayjs(values.startDate).toISOString(),
        dueDate: dayjs(values.dueDate).toISOString(),
      };

      // Add optional standard fields only if they have values
      // According to API docs, description is optional
      if (values.description && values.description.trim() !== '') {
        taskData.description = values.description;
      }
      // Add costingId if selected - optional field
      if (values.costingId) {
        taskData.costingId = values.costingId;
      }
      // Add batchSize if selected - optional field
      if (values.batchSize) {
        taskData.batchSize = values.batchSize;

        // Add raw material details for the selected batch size
        const rawMaterials = getRawMaterialsForBatch(values.batchSize);
        if (rawMaterials && rawMaterials.length > 0) {
          taskData.rawMaterials = rawMaterials.map(rm => ({
            rawMaterialId: rm.rawMaterialId,
            rawMaterialName: rm.rawMaterialName,
            percentage: rm.percentage,
            unitPrice: rm.unitPrice,
            units: rm.units,
            supplier: rm.supplier || '',
            category: rm.category || '',
            kg: rm.kg,
            cost: rm.cost,
          }));
        }
      }

      // STEP 1: Process ALL optional fields from template - ALWAYS include them
      // Map template field keys to API field names
      const fieldMapping = {
        'customerContact': 'customerMobile',
        'costedProduct': 'costingId', // Already handled above, but keep for reference
        'batchSizeRatio': 'batchSize', // Already handled above, but keep for reference
      };

      // Get all possible optional field keys (from template + all known optional fields)
      const allKnownOptionalFields = ['orderNumber', 'customerName', 'customerMobile', 'customerAddress', 'courierNumber', 'courierService'];
      const fieldsToProcess = submitOptionalFields && submitOptionalFields.length > 0
        ? [...new Set([...submitOptionalFields, ...allKnownOptionalFields])]
        : allKnownOptionalFields;

      console.log('=== PROCESSING OPTIONAL FIELDS ===');
      console.log('Template optional fields:', submitOptionalFields);
      console.log('All fields to process:', fieldsToProcess);
      console.log('Form values:', values);

      // Process each optional field
      fieldsToProcess.forEach(fieldKey => {
        // Skip if already handled as special fields
        if (fieldKey === 'costedProduct' || fieldKey === 'batchSizeRatio') {
          return;
        }

        // Map field name for form values lookup
        const formFieldName = fieldMapping[fieldKey] || fieldKey;
        const apiFieldName = fieldMapping[fieldKey] || fieldKey;

        // Get value from form
        let fieldValue = values[formFieldName];

        // If not found, try the original fieldKey
        if (fieldValue === undefined || fieldValue === null) {
          fieldValue = values[fieldKey];
        }

        // ALWAYS add the field to taskData
        // If value exists and is not empty string, use it; otherwise use null
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          taskData[apiFieldName] = fieldValue;
          console.log(`✓ Added ${apiFieldName} = "${fieldValue}"`);
        } else {
          // Field is in template or form, but empty - send null
          taskData[apiFieldName] = null;
          console.log(`✓ Added ${apiFieldName} = null (empty or not provided)`);
        }
      });

      // Ensure these fields are never included (backend auto-generates or doesn't accept them)
      // According to API docs: taskId is auto-generated, comments/views/order are auto-calculated
      const fieldsToRemove = ['taskId', 'id', '_id', 'updatedBy', 'comments', 'views', 'order'];
      fieldsToRemove.forEach(field => {
        if (field in taskData) {
          delete taskData[field];
        }
      });

      // Log final object to console
      console.log('Final Task Data to be sent to backend (POST /tasks):', JSON.stringify(taskData, null, 2));

      onOk(taskData);
      formik.resetForm();
      form.resetFields();
      setSelectedBatchRawMaterials([]);
    },
  });

  // Load users from API - memoized to prevent infinite loops
  const loadUsers = useCallback(async (search = '') => {
    try {
      setLoadingUsers(true);
      const response = await userService.getAllUsers();
      let usersData = response.data?.data || response.data || [];

      // Filter active users only
      usersData = usersData.filter(user => user.isActive !== false);

      // If search term, filter locally
      if (search) {
        const searchLower = search.toLowerCase();
        usersData = usersData.filter(user =>
          user.userName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.mobileNumber?.includes(search)
        );
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load costings from API - memoized to prevent infinite loops
  const loadCostings = useCallback(async (search = '') => {
    try {
      setLoadingCostings(true);
      const response = await costingService.getCostedProducts({
        page: 1,
        limit: 100,
        search: search || undefined,
      });

      let costingsData = [];
      // Handle different response structures
      if (response.data?.data?.data) {
        costingsData = response.data.data.data;
      } else if (response.data?.data) {
        costingsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        costingsData = Array.isArray(response.data) ? response.data : [];
      } else if (response.success && response.data) {
        costingsData = response.data.data || response.data || [];
      }

      // Filter only items with active costings
      costingsData = costingsData.filter(item =>
        item.hasActiveCosting &&
        item.latestCosting?.isActive !== false
      );

      setCostings(costingsData);
    } catch (error) {
      console.error('Error loading costings:', error);
      message.error('Failed to load costed products');
    } finally {
      setLoadingCostings(false);
    }
  }, []);

  // Load customers from API - memoized to prevent infinite loops
  const loadCustomers = useCallback(async (search = '') => {
    try {
      setLoadingCustomers(true);
      // Load all active customers - use higher limit for initial load
      const response = await customerService.getAllCustomers(1, 1000, {
        search: search || undefined,
        status: 'ACTIVE', // Only load active customers
      });

      let customersData = [];
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          customersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          customersData = response.data.data;
        } else if (response.data.records && Array.isArray(response.data.records)) {
          customersData = response.data.records;
        }
      }

      setCustomers(customersData);
      console.log(`Loaded ${customersData.length} customers`);
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  // Load task template when phaseId changes (only if template prop is not provided)
  const loadTaskTemplate = useCallback(async (currentPhaseId) => {
    if (!currentPhaseId || templateProp) {
      // If template prop is provided, don't load
      return;
    }

    try {
      setLoadingTemplate(true);
      const response = await taskService.getTaskTemplate(currentPhaseId);
      if (response.data) {
        const template = response.data?.data || response.data;
        setTaskTemplate(template);
      }
    } catch (error) {
      console.error('Error loading task template:', error);
      // Don't show error message, just set template to null
      setTaskTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  }, [templateProp]);

  // Update taskTemplate when templateProp changes
  useEffect(() => {
    if (templateProp) {
      setTaskTemplate(templateProp);
    }
  }, [templateProp]);

  // Load users, costings, and customers when modal opens
  // Always load customers regardless of template - they'll be used if template includes customer fields
  useEffect(() => {
    if (visible) {
      loadUsers();
      loadCostings();
      // Always load customers when modal opens - they'll be used in selectors if template includes customer fields
      loadCustomers();

      const effectivePhaseId = phaseId || initialValues?.phaseId;
      if (effectivePhaseId && !templateProp) {
        loadTaskTemplate(effectivePhaseId);
      }
    }
  }, [visible, phaseId, initialValues, loadUsers, loadCostings, loadCustomers, loadTaskTemplate, templateProp]);

  // Extract and sort batch sizes from costing totalCosts
  const extractBatchSizes = React.useCallback((totalCosts) => {
    if (!totalCosts || !Array.isArray(totalCosts)) {
      setBatchSizes([]);
      return;
    }

    // Sort batch sizes in a logical order
    const batchOrder = ['batch0_5kg', 'batch1kg', 'batch10kg', 'batch25kg', 'batch50kg', 'batch100kg', 'batch150kg', 'batch200kg'];
    const sorted = totalCosts
      .map(cost => ({
        batchSize: cost.batchSize,
        kg: parseFloat(cost.kg) || 0,
        cost: parseFloat(cost.cost) || 0,
      }))
      .sort((a, b) => {
        const indexA = batchOrder.indexOf(a.batchSize);
        const indexB = batchOrder.indexOf(b.batchSize);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.batchSize.localeCompare(b.batchSize);
      });

    setBatchSizes(sorted);
  }, []);

  // Load batch sizes when costings are loaded and a costing is already selected (for edit mode)
  useEffect(() => {
    const costingId = formik.values.costingId;
    const batchSize = formik.values.batchSize;
    if (costings.length > 0 && costingId && !selectedCosting) {
      const costing = costings.find(c =>
        c.latestCosting?.id === costingId ||
        c.id === costingId
      );
      if (costing?.latestCosting?.totalCosts) {
        setSelectedCosting(costing);
        extractBatchSizes(costing.latestCosting.totalCosts);

        // Load raw materials if batch size is already selected
        if (batchSize) {
          const rawMaterials = getRawMaterialsForBatch(batchSize);
          setSelectedBatchRawMaterials(rawMaterials);
        }
      }
    }
  }, [costings, formik.values.costingId, formik.values.batchSize, selectedCosting, extractBatchSizes]);

  // Handle user search - with debouncing to prevent excessive API calls
  const handleUserSearch = useCallback((value) => {
    setUserSearchTerm(value);

    // Clear previous timeout
    if (userSearchTimeoutRef.current) {
      clearTimeout(userSearchTimeoutRef.current);
    }

    // Only call API if there's a search term, otherwise use cached data
    if (value && value.trim()) {
      userSearchTimeoutRef.current = setTimeout(() => {
        loadUsers(value);
      }, 500);
    } else {
      // If search is cleared, reload all users
      loadUsers();
    }
  }, [loadUsers]);

  // Handle costing search - with debouncing to prevent excessive API calls
  const handleCostingSearch = useCallback((value) => {
    setCostingSearchTerm(value);

    // Clear previous timeout
    if (costingSearchTimeoutRef.current) {
      clearTimeout(costingSearchTimeoutRef.current);
    }

    // Only call API if there's a search term, otherwise use cached data
    if (value && value.trim()) {
      costingSearchTimeoutRef.current = setTimeout(() => {
        loadCostings(value);
      }, 500);
    } else {
      // If search is cleared, reload all costings
      loadCostings();
    }
  }, [loadCostings]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (userSearchTimeoutRef.current) {
        clearTimeout(userSearchTimeoutRef.current);
      }
      if (costingSearchTimeoutRef.current) {
        clearTimeout(costingSearchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch task details and set form values
  useEffect(() => {
    const loadTaskDetailsAndSetValues = async () => {
      let valuesToUse = initialValues;

      // If editing an existing task, fetch latest details
      if (initialValues?.id) {
        try {
          const response = await taskService.getTaskDetails(initialValues.id);
          if (response.data) {
            let responseData = response.data;
            // Handle case where API returns { data: { task: { ... } } } or similar nested structure
            // If responseData.task is an object (not a string), we need to unwrap it
            if (responseData.task && typeof responseData.task === 'object') {
              responseData = { ...responseData, ...responseData.task };
            }
            valuesToUse = { ...initialValues, ...responseData };
          }
        } catch (error) {
          console.error("Failed to load fresh task details:", error);
        }
      }

      if (valuesToUse) {
        // Parse ISO date string or existing format for startDate
        let parsedStartDate = null;
        if (valuesToUse.startDate) {
          if (typeof valuesToUse.startDate === 'string') {
            parsedStartDate = dayjs(valuesToUse.startDate).isValid()
              ? dayjs(valuesToUse.startDate)
              : dayjs(valuesToUse.startDate, 'DD MMM, YYYY');
          } else {
            parsedStartDate = dayjs(valuesToUse.startDate);
          }
        }

        // Parse ISO date string or existing format for dueDate
        let parsedDueDate = null;
        if (valuesToUse.dueDate) {
          if (typeof valuesToUse.dueDate === 'string') {
            parsedDueDate = dayjs(valuesToUse.dueDate).isValid()
              ? dayjs(valuesToUse.dueDate)
              : dayjs(valuesToUse.dueDate, 'DD MMM, YYYY');
          } else {
            parsedDueDate = dayjs(valuesToUse.dueDate);
          }
        }

        // Handle assignedUserId
        let assignedUserIdValue = null;
        if (valuesToUse.assignedUserId) {
          assignedUserIdValue = valuesToUse.assignedUserId;
        } else if (valuesToUse.assignedUser?.id) {
          assignedUserIdValue = valuesToUse.assignedUser.id;
        } else if (valuesToUse.assignee) {
          assignedUserIdValue = typeof valuesToUse.assignee === 'string'
            ? valuesToUse.assignee
            : valuesToUse.assignee?.id;
        }

        // Handle costingId
        let costingIdValue = null;
        if (valuesToUse.costingId) {
          costingIdValue = valuesToUse.costingId;
        } else if (valuesToUse.costing?.id) {
          costingIdValue = valuesToUse.costing.id;
        }

        // Handle batchSize
        let batchSizeValue = valuesToUse.batchSize || null;

        // Handle Filling & Packing phase fields
        let orderNumberValue = valuesToUse.orderNumber || '';
        let customerNameValue = valuesToUse.customerName || '';
        let customerMobileValue = valuesToUse.customerMobile || '';
        let customerAddressValue = valuesToUse.customerAddress || '';

        // Remove taskId from initialValues when editing
        const { taskId: _, id: __, _id: ___, ...valuesWithoutId } = valuesToUse;

        formik.setValues({
          ...valuesWithoutId,
          startDate: parsedStartDate && parsedStartDate.isValid() ? parsedStartDate : null,
          dueDate: parsedDueDate && parsedDueDate.isValid() ? parsedDueDate : null,
          assignedUserId: assignedUserIdValue,
          costingId: costingIdValue,
          batchSize: batchSizeValue,
          orderNumber: orderNumberValue,
          customerName: customerNameValue,
          customerMobile: customerMobileValue,
          customerAddress: customerAddressValue,
        });
        form.setFieldsValue({
          ...valuesWithoutId,
          startDate: parsedStartDate && parsedStartDate.isValid() ? parsedStartDate : null,
          dueDate: parsedDueDate && parsedDueDate.isValid() ? parsedDueDate : null,
        });
      } else {
        // Handle New Task case
        if (phaseId) {
          formik.setFieldValue('phaseId', phaseId);
          form.setFieldsValue({ phaseId });
        }
      }
    };

    if (visible) {
      loadTaskDetailsAndSetValues();
    }
  }, [initialValues, visible, form, phaseId]);

  const handleOk = async () => {
    try {
      await form.validateFields();
      formik.handleSubmit();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  // Handle costing selection change
  const handleCostingChange = (costingId) => {
    formik.setFieldValue('costingId', costingId);
    formik.setFieldValue('batchSize', null); // Reset batch size when costing changes

    if (costingId) {
      const costing = costings.find(c =>
        c.latestCosting?.id === costingId ||
        c.id === costingId
      );
      if (costing?.latestCosting?.totalCosts) {
        setSelectedCosting(costing);
        extractBatchSizes(costing.latestCosting.totalCosts);
      } else {
        setSelectedCosting(null);
        setBatchSizes([]);
      }
    } else {
      setSelectedCosting(null);
      setBatchSizes([]);
    }
  };

  // Format batch size label for display
  const formatBatchSizeLabel = (batchSize) => {
    if (!batchSize) return '';
    // Convert "batch1kg" to "1 kg" or "batch0_5kg" to "0.5 kg"
    const match = batchSize.match(/batch(\d+(?:\.\d+)?)kg/);
    if (match) {
      const kg = match[1].replace('_', '.');
      return `${kg} kg`;
    }
    return batchSize.replace('batch', '').replace(/([A-Z])/g, ' $1').trim();
  };

  // Extract raw material details for selected batch size
  const getRawMaterialsForBatch = useCallback((batchSize) => {
    if (!batchSize || !selectedCosting?.latestCosting?.rawMaterials) {
      return [];
    }

    const rawMaterials = selectedCosting.latestCosting.rawMaterials;
    return rawMaterials.map(material => {
      const batchCalc = material.batchCalculations?.[batchSize];
      return {
        rawMaterialId: material.rawMaterialId,
        rawMaterialName: material.rawMaterialName,
        percentage: material.percentage,
        unitPrice: material.unitPrice,
        units: material.units,
        supplier: material.supplier,
        category: material.category,
        // Batch-specific calculations
        kg: batchCalc?.kg || 0,
        cost: batchCalc?.cost || 0,
      };
    }).filter(material => material.kg > 0 || material.cost > 0); // Only show materials with values
  }, [selectedCosting]);

  // Handle batch size selection change
  const handleBatchSizeChange = useCallback((e) => {
    const batchSize = e.target.value;
    formik.setFieldValue('batchSize', batchSize);

    // Extract raw material details for the selected batch
    if (selectedCosting) {
      const rawMaterials = getRawMaterialsForBatch(batchSize);
      setSelectedBatchRawMaterials(rawMaterials);
    }
  }, [selectedCosting, getRawMaterialsForBatch, formik]);

  const handleCancel = () => {
    formik.resetForm();
    form.resetFields();
    setUserSearchTerm('');
    setCostingSearchTerm('');
    setSelectedCosting(null);
    setBatchSizes([]);
    setSelectedBatchRawMaterials([]);
    setTaskTemplate(null);
    onCancel();
  };

  // Helper function to get field label and icon
  const getFieldLabel = (fieldKey) => {
    const labels = {
      orderNumber: 'Order Number',
      customerName: 'Customer Name',
      customerAddress: 'Customer Address',
      customerContact: 'Customer Contact',
      customerMobile: 'Customer Mobile Number',
      costedProduct: 'Costed Product',
      batchSizeRatio: 'Batch Size Ratio',
      courierNumber: 'Courier Number',
      courierService: 'Courier Service',
    };
    return labels[fieldKey] || fieldKey;
  };

  const getFieldIcon = (fieldKey) => {
    const icons = {
      orderNumber: <ShoppingOutlined />,
      customerName: <UserOutlined />,
      customerAddress: <HomeOutlined />,
      customerContact: <PhoneOutlined />,
      customerMobile: <PhoneOutlined />,
      costedProduct: <DollarOutlined />,
      batchSizeRatio: <SettingOutlined />,
      courierNumber: <ContainerOutlined />,
      courierService: <TruckOutlined />,
    };
    return icons[fieldKey] || null;
  };

  // Helper function to render field based on inputType
  const renderOptionalField = (fieldKey) => {
    const fieldConfig = optionalFieldConfig[fieldKey];
    if (!fieldConfig || !fieldConfig.inputType) return null;

    const inputType = fieldConfig.inputType;
    const label = getFieldLabel(fieldKey);
    const icon = getFieldIcon(fieldKey);
    const fieldName = fieldKey === 'customerContact' ? 'customerMobile' : fieldKey;

    switch (inputType) {
      case 'text':
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            rules={[{ required: fieldKey !== 'courierNumber', message: `Please enter ${label.toLowerCase()}` }]}
          >
            <Input
              prefix={icon}
              value={formik.values[fieldName]}
              onChange={formik.handleChange}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            rules={[{ required: true, message: `Please enter ${label.toLowerCase()}` }]}
          >
            <Input
              type="number"
              prefix={icon}
              value={formik.values[fieldName]}
              onChange={formik.handleChange}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case 'select':
        if (fieldKey === 'costedProduct') {
          // Special handling for costed product
          return (
            <Form.Item
              key={fieldKey}
              label={label}
              name="costingId"
              rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={`Select ${label.toLowerCase()}`}
                value={formik.values.costingId}
                onChange={handleCostingChange}
                onSearch={handleCostingSearch}
                filterOption={false}
                loading={loadingCostings}
                notFoundContent={loadingCostings ? <Spin size="small" /> : 'No items found'}
                suffixIcon={icon}
              >
                {costings.map((costing) => {
                  const productName = costing.itemName || costing.latestCosting?.itemName || 'Unnamed Product';
                  const costingId = costing.latestCosting?.id || costing.id;
                  return (
                    <Option key={costingId} value={costingId} label={productName}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{productName}</div>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          );
        }
        if (fieldKey === 'customerName') {
          // Special handling for customer name - searchable select with auto-fill
          return (
            <Form.Item
              key={fieldKey}
              label={label}
              name={fieldName}
              rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={`Search and select ${label.toLowerCase()}`}
                value={formik.values[fieldName]}
                onChange={(value) => {
                  // Update both formik and Ant Design form
                  formik.setFieldValue(fieldName, value);
                  form.setFieldValue(fieldName, value);

                  // Auto-fill customer mobile and address when customer is selected
                  if (value) {
                    // Find customer by ID or name (value can be either)
                    const selectedCustomer = customers.find(c => {
                      const customerId = c.id || c._id;
                      const customerName = c.name;
                      return customerId === value || customerName === value;
                    });

                    if (selectedCustomer) {
                      // Auto-fill mobile number (from smsPhone or mobileNumber or phone)
                      const mobile = selectedCustomer.smsPhone || selectedCustomer.mobileNumber || selectedCustomer.phone || '';
                      if (mobile && (optionalFields.includes('customerContact') || optionalFields.includes('customerMobile'))) {
                        formik.setFieldValue('customerMobile', mobile);
                        form.setFieldValue('customerMobile', mobile);
                      }

                      // Auto-fill address
                      const address = selectedCustomer.address || selectedCustomer.fullAddress || '';
                      if (address && optionalFields.includes('customerAddress')) {
                        formik.setFieldValue('customerAddress', address);
                        form.setFieldValue('customerAddress', address);
                      }
                    }
                  } else {
                    // Clear related fields if customer is cleared
                    if (optionalFields.includes('customerContact') || optionalFields.includes('customerMobile')) {
                      formik.setFieldValue('customerMobile', '');
                      form.setFieldValue('customerMobile', '');
                    }
                    if (optionalFields.includes('customerAddress')) {
                      formik.setFieldValue('customerAddress', '');
                      form.setFieldValue('customerAddress', '');
                    }
                  }
                }}
                onSearch={(value) => {
                  setCustomerSearchTerm(value);
                  // Debounce search
                  if (customerSearchTimeoutRef.current) {
                    clearTimeout(customerSearchTimeoutRef.current);
                  }
                  customerSearchTimeoutRef.current = setTimeout(() => {
                    loadCustomers(value);
                  }, 500);
                }}
                filterOption={false}
                loading={loadingCustomers}
                notFoundContent={loadingCustomers ? <Spin size="small" /> : 'No customers found'}
                suffixIcon={icon}
                optionLabelProp="label"
              >
                {customers && customers.length > 0 ? (
                  customers.map((customer) => {
                    const customerName = customer.name || 'Unnamed Customer';
                    // Use customer ID as value, but also allow searching by name
                    const customerId = customer.id || customer._id;
                    // Store customer ID as value, but display name
                    return (
                      <Option key={customerId || customerName} value={customerId || customerName} label={customerName}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{customerName}</div>
                          {(customer.smsPhone || customer.mobileNumber || customer.phone) && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                              {customer.smsPhone || customer.mobileNumber || customer.phone}
                            </div>
                          )}
                          {customer.cityArea && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                              {customer.cityArea}
                            </div>
                          )}
                          {customer.address && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="no-customers">No customers available</Option>
                )}
              </Select>
            </Form.Item>
          );
        }
        if (fieldKey === 'courierService') {
          return (
            <Form.Item
              key={fieldKey}
              label={label}
              name={fieldName}
              rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
            >
              <Select
                placeholder={`Select ${label.toLowerCase()}`}
                value={formik.values[fieldName]}
                onChange={(value) => formik.setFieldValue(fieldName, value)}
              >
                <Option value="AC">AC</Option>
                <Option value="CityPack">CityPack</Option>
              </Select>
            </Form.Item>
          );
        }
        // Generic select - would need options from backend or config
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
          >
            <Select
              placeholder={`Select ${label.toLowerCase()}`}
              value={formik.values[fieldName]}
              onChange={(value) => formik.setFieldValue(fieldName, value)}
            >
              {/* Options would come from backend or config */}
              <Option value="AC">AC</Option>
              <Option value="CityPack">CityPack</Option>
            </Select>
          </Form.Item>
        );

      case 'ratios':
        if (fieldKey === 'batchSizeRatio') {
          // Special handling for batch size ratio - only show if costing is selected
          if (!selectedCosting || batchSizes.length === 0) {
            return null;
          }

          return (
            <Form.Item
              key={fieldKey}
              label={label}
              name="batchSize"
              rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
              tooltip="Select the batch size for this task"
            >
              <Radio.Group
                value={formik.values.batchSize}
                onChange={handleBatchSizeChange}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  {batchSizes.map((batch) => (
                    <Col span={12} key={batch.batchSize}>
                      <Radio value={batch.batchSize} style={{ width: '100%' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {formatBatchSizeLabel(batch.batchSize)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                            Cost: LKR {parseFloat(batch.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
          );
        }
        // Generic ratios
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
          >
            <Radio.Group value={formik.values[fieldName]} onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}>
              {/* Options would come from backend or config */}
            </Radio.Group>
          </Form.Item>
        );

      case 'check':
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            valuePropName="checked"
          >
            <Checkbox checked={formik.values[fieldName]} onChange={(e) => formik.setFieldValue(fieldName, e.target.checked)}>
              {label}
            </Checkbox>
          </Form.Item>
        );

      case 'radio':
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
            rules={[{ required: true, message: `Please select ${label.toLowerCase()}` }]}
          >
            <Radio.Group value={formik.values[fieldName]} onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}>
              {/* Options would come from backend or config */}
              <Radio value="option1">Option 1</Radio>
              <Radio value="option2">Option 2</Radio>
            </Radio.Group>
          </Form.Item>
        );

      case 'checkboxGroup':
        return (
          <Form.Item
            key={fieldKey}
            label={label}
            name={fieldName}
          >
            <Checkbox.Group value={formik.values[fieldName]} onChange={(values) => formik.setFieldValue(fieldName, values)}>
              {/* Options would come from backend or config */}
              <Checkbox value="option1">Option 1</Checkbox>
              <Checkbox value="option2">Option 2</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Task' : 'Add New Task'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      okText="Save"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          Object.keys(changedValues).forEach((key) => {
            formik.setFieldValue(key, allValues[key]);
          });
        }}
      >
        <Form.Item
          label="Task Title"
          name="task"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input
            value={formik.values.task}
            onChange={formik.handleChange}
            placeholder="Enter task title"
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            value={formik.values.description}
            onChange={formik.handleChange}
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Assign To"
              name="assignedUserId"
              tooltip="Select a user to assign this task to"
            >
              <Select
                showSearch
                allowClear
                placeholder="Select user (optional)"
                value={formik.values.assignedUserId}
                onChange={(value) => formik.setFieldValue('assignedUserId', value)}
                onSearch={handleUserSearch}
                filterOption={false}
                loading={loadingUsers}
                notFoundContent={loadingUsers ? <Spin size="small" /> : 'No users found'}
                suffixIcon={<UserOutlined />}
                optionLabelProp="label"
              >
                {users.map((user) => (
                  <Option
                    key={user.id}
                    value={user.id}
                    label={user.userName || user.email || 'Unnamed User'}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.userName || user.email || 'Unnamed User'}</div>
                      {user.email && user.email !== user.userName && (
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{user.email}</div>
                      )}
                      {user.role?.name && (
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{user.role.name}</div>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                value={formik.values.status}
                onChange={(value) => formik.setFieldValue('status', value)}
              >
                {Object.keys(TASK_STATUS_LABELS).map((status) => (
                  <Option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Costed Product - Render in main form if in template, or show hardcoded if no template */}
        {(optionalFields.includes('costedProduct') || (!currentTemplate || !Array.isArray(currentTemplate.optionalFields))) && (
          <Row gutter={16}>
            <Col span={12}>
              {optionalFields.includes('costedProduct') ? (
                // Render from template
                renderOptionalField('costedProduct')
              ) : (
                // Hardcoded for backward compatibility
                <Form.Item
                  label="Costed Product"
                  name="costingId"
                  tooltip="Associate this task with a costed product (optional)"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select costed product (optional)"
                    value={formik.values.costingId}
                    onChange={handleCostingChange}
                    onSearch={handleCostingSearch}
                    filterOption={false}
                    loading={loadingCostings}
                    notFoundContent={loadingCostings ? <Spin size="small" /> : 'No costed products found'}
                    suffixIcon={<DollarOutlined />}
                    optionLabelProp="label"
                  >
                    {costings.map((costing) => {
                      const productName = costing.itemName || costing.latestCosting?.itemName || 'Unnamed Product';
                      const costingId = costing.latestCosting?.id || costing.id;
                      return (
                        <Option
                          key={costingId}
                          value={costingId}
                          label={productName}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>{productName}</div>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              )}
            </Col>
            <Col span={12}>
              <Form.Item label="Priority" name="priority">
                <Select
                  value={formik.values.priority}
                  onChange={(value) => formik.setFieldValue('priority', value)}
                  placeholder="Select priority (optional)"
                >
                  {Object.keys(TASK_PRIORITY_LABELS).map((priority) => (
                    <Option key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Priority only row - when costedProduct is not shown */}
        {!optionalFields.includes('costedProduct') && currentTemplate && Array.isArray(currentTemplate.optionalFields) && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Priority" name="priority">
                <Select
                  value={formik.values.priority}
                  onChange={(value) => formik.setFieldValue('priority', value)}
                  placeholder="Select priority (optional)"
                >
                  {Object.keys(TASK_PRIORITY_LABELS).map((priority) => (
                    <Option key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Active Recipe Version Display - Show when costing has activeRecipe */}
        {selectedCosting && selectedCosting.activeRecipe && (
          <div style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: '#fff1f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
          }}>
            <Row align="middle" gutter={8}>
              <Col>
                <BookOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
              </Col>
              <Col flex="auto">
                <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                  Active Recipe Version: {selectedCosting.activeRecipe.name || 'Recipe'}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="green" style={{ marginRight: 8 }}>
                    Version {selectedCosting.activeRecipe.version}
                  </Tag>
                  {selectedCosting.activeRecipe.isActiveVersion && (
                    <Tag color="green">Active</Tag>
                  )}
                  {selectedCosting.activeRecipe.batchSize && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      Batch: {formatBatchSizeLabel(selectedCosting.activeRecipe.batchSize)}
                    </Tag>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Batch Size Selection - Show when costing is selected AND batchSizeRatio is in template OR no template */}
        {selectedCosting && batchSizes.length > 0 && (
          optionalFields.includes('batchSizeRatio') ? (
            // Render from template if in optionalFields
            renderOptionalField('batchSizeRatio')
          ) : (
            // Hardcoded for backward compatibility or when not in template
            <Form.Item
              label="Batch Size"
              name="batchSize"
              tooltip="Select the batch size for this task"
            >
              <Radio.Group
                value={formik.values.batchSize}
                onChange={handleBatchSizeChange}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  {batchSizes.map((batch) => (
                    <Col span={12} key={batch.batchSize}>
                      <Radio value={batch.batchSize} style={{ width: '100%' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {formatBatchSizeLabel(batch.batchSize)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                            Cost: LKR {parseFloat(batch.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
          )
        )}

        {/* Raw Material Details Alert - Show when batch size is selected */}
        {formik.values.batchSize && selectedBatchRawMaterials.length > 0 && (
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Divider style={{ margin: '16px 0' }} />
            <Alert
              message="Raw Materials Required for Selected Batch Size"
              description={
                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Batch Size: {formatBatchSizeLabel(formik.values.batchSize)}
                  </Text>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Raw Material</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Percentage</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Amount (kg)</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Cost (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatchRawMaterials.map((material, index) => (
                          <tr key={material.rawMaterialId || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '8px' }}>
                              <div>
                                <Text strong>{material.rawMaterialName || 'N/A'}</Text>
                                {material.category && (
                                  <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                    {material.category}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              {parseFloat(material.percentage || 0).toFixed(2)}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              {parseFloat(material.kg || 0).toFixed(2)} {material.units || 'kg'}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              LKR {parseFloat(material.unitPrice || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                              LKR {parseFloat(material.cost || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '2px solid #1890ff', fontWeight: 600 }}>
                          <td colSpan={4} style={{ padding: '8px', textAlign: 'right' }}>
                            Total Cost:
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#1890ff' }}>
                            LKR {selectedBatchRawMaterials
                              .reduce((sum, m) => sum + parseFloat(m.cost || 0), 0)
                              .toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Start Date" name="startDate" required>
              <DatePicker
                style={{ width: '100%' }}
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                format="YYYY-MM-DD"
                showTime={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Due Date" name="dueDate" required>
              <DatePicker
                style={{ width: '100%' }}
                value={formik.values.dueDate}
                onChange={(date) => formik.setFieldValue('dueDate', date)}
                format="YYYY-MM-DD"
                showTime={false}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Dynamic Optional Fields based on Template - Exclude costedProduct and batchSizeRatio as they're rendered in main form */}
        {optionalFields.filter(fieldKey => fieldKey !== 'costedProduct' && fieldKey !== 'batchSizeRatio').length > 0 && (
          <>
            <Divider style={{ margin: '24px 0' }}>Additional Information</Divider>
            {optionalFields
              .filter(fieldKey => fieldKey !== 'costedProduct' && fieldKey !== 'batchSizeRatio')
              .map(fieldKey => renderOptionalField(fieldKey))}
          </>
        )}

        {/* Legacy: Filling & Packing Phase Specific Fields (for backward compatibility) */}
        {isFillingAndPackingPhase && optionalFields.length === 0 && (
          <>
            <Divider style={{ margin: '24px 0' }}>Order & Customer Information</Divider>

            <Form.Item
              label="Order Number"
              name="orderNumber"
              rules={[{ required: true, message: 'Please enter order number' }]}
            >
              <Input
                prefix={<ShoppingOutlined />}
                value={formik.values.orderNumber}
                onChange={formik.handleChange}
                placeholder="Enter order number (e.g., ORD-2024-001)"
              />
            </Form.Item>

            <Form.Item
              label="Customer Name"
              name="customerName"
              rules={[{ required: true, message: 'Please select customer name' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Search and select customer name"
                value={formik.values.customerName}
                onChange={(value) => {
                  // Update both formik and Ant Design form
                  formik.setFieldValue('customerName', value);
                  form.setFieldValue('customerName', value);

                  // Auto-fill customer mobile and address when customer is selected
                  if (value) {
                    // Find customer by ID or name (value can be either)
                    const selectedCustomer = customers.find(c => {
                      const customerId = c.id || c._id;
                      const customerName = c.name;
                      return customerId === value || customerName === value;
                    });

                    if (selectedCustomer) {
                      // Auto-fill mobile number (from smsPhone or mobileNumber or phone)
                      const mobile = selectedCustomer.smsPhone || selectedCustomer.mobileNumber || selectedCustomer.phone || '';
                      if (mobile) {
                        formik.setFieldValue('customerMobile', mobile);
                        form.setFieldValue('customerMobile', mobile);
                      }

                      // Auto-fill address
                      const address = selectedCustomer.address || selectedCustomer.fullAddress || '';
                      if (address) {
                        formik.setFieldValue('customerAddress', address);
                        form.setFieldValue('customerAddress', address);
                      }
                    }
                  } else {
                    // Clear related fields if customer is cleared
                    formik.setFieldValue('customerMobile', '');
                    form.setFieldValue('customerMobile', '');
                    formik.setFieldValue('customerAddress', '');
                    form.setFieldValue('customerAddress', '');
                  }
                }}
                onSearch={(value) => {
                  setCustomerSearchTerm(value);
                  // Debounce search
                  if (customerSearchTimeoutRef.current) {
                    clearTimeout(customerSearchTimeoutRef.current);
                  }
                  customerSearchTimeoutRef.current = setTimeout(() => {
                    loadCustomers(value);
                  }, 500);
                }}
                filterOption={false}
                loading={loadingCustomers}
                notFoundContent={loadingCustomers ? <Spin size="small" /> : 'No customers found'}
                suffixIcon={<UserOutlined />}
                optionLabelProp="label"
              >
                {customers && customers.length > 0 ? (
                  customers.map((customer) => {
                    const customerName = customer.name || 'Unnamed Customer';
                    const customerId = customer.id || customer._id;
                    return (
                      <Option key={customerId || customerName} value={customerId || customerName} label={customerName}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{customerName}</div>
                          {(customer.smsPhone || customer.mobileNumber || customer.phone) && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                              {customer.smsPhone || customer.mobileNumber || customer.phone}
                            </div>
                          )}
                          {customer.cityArea && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                              {customer.cityArea}
                            </div>
                          )}
                          {customer.address && (
                            <div style={{ fontSize: '11px', color: '#8c8c8c', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="no-customers">No customers available</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label="Customer Mobile Number"
              name="customerMobile"
              rules={[
                { required: true, message: 'Please enter customer mobile number' },
                {
                  pattern: /^(\+?94|0)?[0-9]{9}$/,
                  message: 'Invalid mobile number format. Must be valid (e.g., +94771234567, 0771234567)'
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                value={formik.values.customerMobile}
                onChange={formik.handleChange}
                placeholder="Enter mobile number (e.g., +94771234567 or 0771234567)"
              />
            </Form.Item>

            <Form.Item
              label="Customer Address"
              name="customerAddress"
              rules={[{ required: true, message: 'Please enter customer address' }]}
            >
              <TextArea
                value={formik.values.customerAddress}
                onChange={formik.handleChange}
                placeholder="Enter customer delivery address"
                rows={3}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
