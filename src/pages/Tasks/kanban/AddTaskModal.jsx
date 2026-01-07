import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Row, Col, Spin, Radio, Alert, Divider, Typography, Tag } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { TASK_STATUS, TASK_PRIORITY, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from './types';
import * as userService from '../../../service/userService';
import * as costingService from '../../../service/costingService';
import { UserOutlined, DollarOutlined, BookOutlined } from '@ant-design/icons';

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

const AddTaskModal = ({ visible, onCancel, onOk, phaseId, initialValues }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [costings, setCostings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCostings, setLoadingCostings] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [costingSearchTerm, setCostingSearchTerm] = useState('');
  const [selectedCosting, setSelectedCosting] = useState(null);
  const [batchSizes, setBatchSizes] = useState([]);
  const [selectedBatchRawMaterials, setSelectedBatchRawMaterials] = useState([]);
  const userSearchTimeoutRef = useRef(null);
  const costingSearchTimeoutRef = useRef(null);

  const { Text } = Typography;

  const validationSchema = Yup.object({
    task: Yup.string().required('Task title is required'),
    status: Yup.string().required('Status is required'),
    phaseId: Yup.string().required('Phase is required'),
  });

  // Initialize formik first (before any useEffect that depends on it)
  const formik = useFormik({
    initialValues: initialValues || {
      task: '',
      description: '',
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
    },
    validationSchema,
    onSubmit: (values) => {
      // Prepare task data according to API requirements - exact structure
      const taskData = {
        task: values.task,
        phaseId: values.phaseId,
        status: values.status,
        comments: values.comments !== undefined && values.comments !== null ? values.comments : 0,
        views: values.views !== undefined && values.views !== null ? values.views : 0,
        order: values.order !== undefined && values.order !== null ? values.order : 0,
      };

      // Add optional fields only if they have values
      if (values.description) {
        taskData.description = values.description;
      }
      if (values.priority) {
        taskData.priority = values.priority;
      }
      if (values.dueDate) {
        taskData.dueDate = dayjs(values.dueDate).toISOString();
      }
      // Use assignedUserId (UUID) instead of assignees array
      if (values.assignedUserId) {
        taskData.assignedUserId = values.assignedUserId;
      }
      // Add costingId if selected
      if (values.costingId) {
        taskData.costingId = values.costingId;
      }
      // Add batchSize if selected
      if (values.batchSize) {
        taskData.batchSize = values.batchSize;
        
        // Add raw material details for the selected batch size
        const rawMaterials = getRawMaterialsForBatch(values.batchSize);
        if (rawMaterials.length > 0) {
          taskData.rawMaterials = rawMaterials.map(rm => ({
            rawMaterialId: rm.rawMaterialId,
            rawMaterialName: rm.rawMaterialName,
            percentage: rm.percentage,
            unitPrice: rm.unitPrice,
            units: rm.units,
            supplier: rm.supplier,
            category: rm.category,
            kg: rm.kg,
            cost: rm.cost,
          }));
        }
      }

      // Ensure taskId, id, _id, and updatedBy are never included (explicit check)
      if ('taskId' in taskData) {
        delete taskData.taskId;
      }
      if ('id' in taskData) {
        delete taskData.id;
      }
      if ('_id' in taskData) {
        delete taskData._id;
      }
      if ('updatedBy' in taskData) {
        delete taskData.updatedBy;
      }

      // Log final object to console
      console.log('Final Task Data to be sent to backend:', JSON.stringify(taskData, null, 2));
      
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

  // Load users when modal opens - only once when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadUsers();
      loadCostings();
    }
  }, [visible, loadUsers, loadCostings]);

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

  useEffect(() => {
    if (initialValues) {
      // Parse ISO date string or existing format
      let parsedDate = null;
      if (initialValues.dueDate) {
        if (typeof initialValues.dueDate === 'string') {
          parsedDate = dayjs(initialValues.dueDate).isValid() 
            ? dayjs(initialValues.dueDate) 
            : dayjs(initialValues.dueDate, 'DD MMM, YYYY');
        } else {
          parsedDate = dayjs(initialValues.dueDate);
        }
      }
      
      // Handle assignedUserId - could be from assignedUser object or direct ID
      let assignedUserIdValue = null;
      if (initialValues.assignedUserId) {
        assignedUserIdValue = initialValues.assignedUserId;
      } else if (initialValues.assignedUser?.id) {
        assignedUserIdValue = initialValues.assignedUser.id;
      } else if (initialValues.assignee) {
        // Legacy support - if assignee is an object with id, use it
        assignedUserIdValue = typeof initialValues.assignee === 'string' 
          ? initialValues.assignee 
          : initialValues.assignee?.id;
      }

      // Handle costingId - could be from costing object or direct ID
      let costingIdValue = null;
      if (initialValues.costingId) {
        costingIdValue = initialValues.costingId;
      } else if (initialValues.costing?.id) {
        costingIdValue = initialValues.costing.id;
      }

      // Handle batchSize
      let batchSizeValue = initialValues.batchSize || null;

      // Remove taskId from initialValues when editing (it's read-only, auto-generated by backend)
      const { taskId: _, id: __, _id: ___, ...initialValuesWithoutId } = initialValues;

      formik.setValues({
        ...initialValuesWithoutId,
        dueDate: parsedDate && parsedDate.isValid() ? parsedDate : null,
        assignedUserId: assignedUserIdValue,
        costingId: costingIdValue,
        batchSize: batchSizeValue,
      });
      form.setFieldsValue({
        ...initialValuesWithoutId,
        dueDate: parsedDate && parsedDate.isValid() ? parsedDate : null,
        assignedUserId: assignedUserIdValue,
        costingId: costingIdValue,
        batchSize: batchSizeValue,
      });

      // Load batch sizes if costing is selected
      if (costingIdValue && costings.length > 0) {
        const costing = costings.find(c => 
          c.latestCosting?.id === costingIdValue || 
          c.id === costingIdValue
        );
        if (costing?.latestCosting?.totalCosts) {
          setSelectedCosting(costing);
          extractBatchSizes(costing.latestCosting.totalCosts);
          
          // Load raw materials if batch size is already selected
          if (batchSizeValue && costing?.latestCosting?.rawMaterials) {
            const materialsData = costing.latestCosting.rawMaterials.map(material => {
              const batchCalc = material.batchCalculations?.[batchSizeValue];
              return {
                rawMaterialId: material.rawMaterialId,
                rawMaterialName: material.rawMaterialName,
                percentage: material.percentage,
                unitPrice: material.unitPrice,
                units: material.units,
                supplier: material.supplier,
                category: material.category,
                kg: batchCalc?.kg || 0,
                cost: batchCalc?.cost || 0,
              };
            }).filter(material => material.kg > 0 || material.cost > 0);
            setSelectedBatchRawMaterials(materialsData);
          }
        }
      }
    } else {
      if (phaseId) {
        formik.setFieldValue('phaseId', phaseId);
        form.setFieldsValue({ phaseId });
      }
    }
  }, [initialValues, phaseId]);

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
    onCancel();
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

        <Row gutter={16}>
          <Col span={12}>
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
                        {costing.itemCode && (
                          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                            Code: {costing.itemCode}
                          </div>
                        )}
                        {costing.latestCosting?.version && (
                          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                            Version: {costing.latestCosting.version}
                          </div>
                        )}
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
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

        {/* Batch Size Selection - Show only when a costing is selected */}
        {selectedCosting && batchSizes.length > 0 && (
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

        <Form.Item label="Due Date" name="dueDate">
          <DatePicker
            style={{ width: '100%' }}
            value={formik.values.dueDate}
            onChange={(date) => formik.setFieldValue('dueDate', date)}
            format="YYYY-MM-DD"
            showTime={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
