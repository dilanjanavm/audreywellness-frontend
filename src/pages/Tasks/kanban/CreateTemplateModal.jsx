import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Form, 
    Input, 
    Select, 
    DatePicker, 
    Switch, 
    Space, 
    Typography, 
    Divider, 
    Card, 
    Tag,
    Checkbox,
    Alert,
    Row,
    Col
} from 'antd';
import { 
    FileTextOutlined, 
    CheckCircleOutlined,
    UserOutlined,
    ShoppingOutlined,
    PhoneOutlined,
    HomeOutlined,
    DollarOutlined,
    ContainerOutlined,
    TruckOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

// Optional field configurations
const OPTIONAL_FIELDS = [
    {
        key: 'orderNumber',
        label: 'Order Number',
        icon: <ShoppingOutlined />,
        defaultType: 'text',
        description: 'Reference ID for the order',
        allowedTypes: ['text', 'number', 'select', 'radio']
    },
    {
        key: 'customerName',
        label: 'Customer Name',
        icon: <UserOutlined />,
        defaultType: 'text',
        description: 'Part of Customer Details',
        allowedTypes: ['text', 'select', 'radio']
    },
    {
        key: 'customerAddress',
        label: 'Customer Address',
        icon: <HomeOutlined />,
        defaultType: 'text',
        description: 'Part of Customer Details',
        allowedTypes: ['text']
    },
    {
        key: 'customerContact',
        label: 'Customer Contact',
        icon: <PhoneOutlined />,
        defaultType: 'text',
        description: 'Mobile number - Part of Customer Details',
        allowedTypes: ['text', 'number']
    },
    {
        key: 'costedProduct',
        label: 'Costed Product',
        icon: <DollarOutlined />,
        defaultType: 'select',
        description: 'Link to product costing data',
        allowedTypes: ['select', 'text', 'radio', 'checkboxGroup']
    },
    {
        key: 'batchSizeRatio',
        label: 'Batch Size Ratio',
        icon: <SettingOutlined />,
        defaultType: 'ratios',
        description: 'Selects specific batch size from available batches',
        allowedTypes: ['ratios', 'select', 'number', 'radio']
    },
    {
        key: 'courierNumber',
        label: 'Courier Number',
        icon: <ContainerOutlined />,
        defaultType: 'text',
        description: 'Tracking number for logistics',
        allowedTypes: ['text', 'number']
    },
    {
        key: 'courierService',
        label: 'Courier Service',
        icon: <TruckOutlined />,
        defaultType: 'select',
        description: 'Vendor selection (e.g., DHL, Fedex)',
        allowedTypes: ['select', 'text', 'check', 'radio', 'checkboxGroup']
    }
];

// Input type options
const INPUT_TYPES = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'select', label: 'Select' },
    { value: 'ratios', label: 'Ratios' },
    { value: 'check', label: 'Check' },
    { value: 'radio', label: 'Radio Button Group' },
    { value: 'checkboxGroup', label: 'Checkbox Group' }
];

const CreateTemplateModal = ({ 
    visible, 
    onCancel, 
    onOk, 
    initialValues,
    isEdit = false,
    phases = []
}) => {
    const [form] = Form.useForm();
    const [selectedOptionalFields, setSelectedOptionalFields] = useState([]);
    const [optionalFieldTypes, setOptionalFieldTypes] = useState({}); // Store input types for each field


    // Initialize form values
    useEffect(() => {
        if (visible) {
            if (initialValues) {
                // Edit mode
                const optionalFields = initialValues.optionalFields || [];
                setSelectedOptionalFields(optionalFields);
                
                // Load field types from optionalFieldConfig
                const fieldTypes = {};
                if (initialValues.optionalFieldConfig) {
                    optionalFields.forEach(fieldKey => {
                        const fieldConfig = initialValues.optionalFieldConfig[fieldKey];
                        if (fieldConfig && fieldConfig.inputType) {
                            fieldTypes[fieldKey] = fieldConfig.inputType;
                        } else {
                            // Use default type from OPTIONAL_FIELDS
                            const fieldDef = OPTIONAL_FIELDS.find(f => f.key === fieldKey);
                            fieldTypes[fieldKey] = fieldDef?.defaultType || 'text';
                        }
                    });
                } else {
                    // Set default types
                    optionalFields.forEach(fieldKey => {
                        const fieldDef = OPTIONAL_FIELDS.find(f => f.key === fieldKey);
                        fieldTypes[fieldKey] = fieldDef?.defaultType || 'text';
                    });
                }
                setOptionalFieldTypes(fieldTypes);
                
                form.setFieldsValue({
                    name: initialValues.name,
                    description: initialValues.description,
                    isDefault: initialValues.isDefault || false,
                    assignedPhaseId: initialValues.assignedPhaseId || null,
                });
            } else {
                // Create mode
                form.resetFields();
                setSelectedOptionalFields([]);
                setOptionalFieldTypes({});
                form.setFieldsValue({
                    isDefault: false,
                });
            }
        }
    }, [visible, initialValues, form]);

    const handleOptionalFieldToggle = (fieldKey, checked) => {
        if (checked) {
            setSelectedOptionalFields([...selectedOptionalFields, fieldKey]);
            // Set default input type when field is selected
            const fieldDef = OPTIONAL_FIELDS.find(f => f.key === fieldKey);
            setOptionalFieldTypes({
                ...optionalFieldTypes,
                [fieldKey]: fieldDef?.defaultType || 'text'
            });
        } else {
            setSelectedOptionalFields(selectedOptionalFields.filter(key => key !== fieldKey));
            // Remove field type when deselected
            const newTypes = { ...optionalFieldTypes };
            delete newTypes[fieldKey];
            setOptionalFieldTypes(newTypes);
        }
    };

    const handleInputTypeChange = (fieldKey, inputType) => {
        setOptionalFieldTypes({
            ...optionalFieldTypes,
            [fieldKey]: inputType
        });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Build template data structure
            // Template defines which fields to include in the form, not actual values
            const templateData = {
                name: values.name,
                description: values.description || '',
                isDefault: values.isDefault || false,
                assignedPhaseId: values.assignedPhaseId || null,
                // Mandatory fields are always included - just define the structure
                mandatoryFields: {
                    taskName: true,        // Field exists in form
                    taskDescription: true, // Field exists in form
                    assignTo: true,        // Field exists in form
                    priority: true,        // Field exists in form
                    startDate: true,       // Field exists in form
                    endDate: true,         // Field exists in form
                    status: true,          // Field exists in form
                },
                // Optional fields that should be included in the form
                optionalFields: selectedOptionalFields,
                // Optional field configurations (input types, validation rules, etc.)
                optionalFieldConfig: {}
            };

            // Add input type configuration for each selected optional field
            selectedOptionalFields.forEach(fieldKey => {
                templateData.optionalFieldConfig[fieldKey] = {
                    inputType: optionalFieldTypes[fieldKey] || 'text'
                };
            });

            await onOk(templateData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedOptionalFields([]);
        onCancel();
    };

    return (
        <Modal
            title={isEdit ? 'Edit Task Template' : 'Create Task Template'}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            width={900}
            okText={isEdit ? 'Update' : 'Create'}
            cancelText="Cancel"
            style={{ top: 20 }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    isDefault: false,
                }}
            >
                {/* Basic Template Info */}
                <Card size="small" style={{ marginBottom: 16, background: '#f0f7ff' }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Template Information
                    </Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Template Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter template name' }]}
                            >
                                <Input
                                    placeholder="Enter template name"
                                    prefix={<FileTextOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Description"
                                name="description"
                            >
                                <Input placeholder="Template description (optional)" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Mandatory Core Fields */}
                <Card size="small" style={{ marginBottom: 16, border: '2px solid #52c41a' }}>
                    <Title level={5} style={{ marginBottom: 16, color: '#52c41a' }}>
                        <CheckCircleOutlined style={{ marginRight: 8 }} />
                        Mandatory Core Fields (Fixed)
                    </Title>
                    <Alert
                        message="These fields are always included in the task form and cannot be disabled"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div><Tag color="green">Task Name</Tag> <Text type="secondary">(Text Input)</Text></div>
                            <div><Tag color="green">Task Description</Tag> <Text type="secondary">(Text Area)</Text></div>
                            <div><Tag color="green">Assign To</Tag> <Text type="secondary">(User Selector)</Text></div>
                            <div><Tag color="green">Priority</Tag> <Text type="secondary">(Dropdown: High/Medium/Low)</Text></div>
                            <div><Tag color="green">Start Date</Tag> <Text type="secondary">(Date Picker)</Text></div>
                            <div><Tag color="green">End Date</Tag> <Text type="secondary">(Date Picker)</Text></div>
                            <div><Tag color="green">Status</Tag> <Text type="secondary">(Dropdown)</Text></div>
                        </Space>
                    </div>
                </Card>

                {/* Optional Fields */}
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Configurable Optional Fields (Selectable)
                    </Title>
                    <Alert
                        message="Select which optional fields to include in this template"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Row gutter={[16, 16]}>
                        {OPTIONAL_FIELDS.map(field => (
                            <Col span={12} key={field.key}>
                                <Card
                                    size="small"
                                    style={{
                                        border: selectedOptionalFields.includes(field.key) 
                                            ? '2px solid #1890ff' 
                                            : '1px solid #d9d9d9',
                                        background: selectedOptionalFields.includes(field.key) 
                                            ? '#f0f7ff' 
                                            : '#fff'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <Checkbox
                                            checked={selectedOptionalFields.includes(field.key)}
                                            onChange={(e) => handleOptionalFieldToggle(field.key, e.target.checked)}
                                        >
                                            <Space>
                                                {field.icon}
                                                <Text strong>{field.label}</Text>
                                            </Space>
                                        </Checkbox>
                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: 24 }}>
                                            {field.description}
                                        </Text>
                                        {selectedOptionalFields.includes(field.key) && (
                                            <div style={{ marginLeft: 24, marginTop: 8 }}>
                                                <Form.Item
                                                    label={<Text style={{ fontSize: '12px' }}>Input Type</Text>}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select
                                                        value={optionalFieldTypes[field.key] || field.defaultType}
                                                        onChange={(value) => handleInputTypeChange(field.key, value)}
                                                        style={{ width: '100%' }}
                                                        size="small"
                                                    >
                                                        {INPUT_TYPES
                                                            .filter(type => 
                                                                !field.allowedTypes || 
                                                                field.allowedTypes.includes(type.value)
                                                            )
                                                            .map(type => (
                                                                <Option key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </Option>
                                                            ))
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>

                {/* Phase Association */}
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Phase Association
                    </Title>
                    <Alert
                        message="Link this template to a specific phase. If not assigned, the default template will be used."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Form.Item
                        label="Assign to Phase"
                        name="assignedPhaseId"
                    >
                        <Select
                            placeholder="Select a phase (optional)"
                            allowClear
                        >
                            {phases.map(phase => (
                                <Option key={phase.id} value={phase.id}>
                                    <Space>
                                        <Tag color={phase.color}>{phase.name}</Tag>
                                        {phase.description && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {phase.description}
                                            </Text>
                                        )}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Card>

                {/* Default Template Option */}
                <Form.Item
                    label="Set as Default Template"
                    name="isDefault"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateTemplateModal;
