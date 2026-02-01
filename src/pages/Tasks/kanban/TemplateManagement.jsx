import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    Table, 
    Button, 
    Space, 
    message, 
    Modal, 
    Popconfirm, 
    Tag, 
    Typography, 
    Empty,
    Spin,
    Tooltip,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import * as templateService from '../../../service/templateService';
import CreateTemplateModal from './CreateTemplateModal';
import './TemplateManagement.css';

const { Title, Text } = Typography;

const TemplateManagement = ({ phases, onTemplateApplied, onTemplateDeleted }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Load templates
    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await templateService.getAllTemplates();
            let templatesData = [];
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    templatesData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    templatesData = response.data.data;
                } else if (response.data.data && typeof response.data.data === 'object') {
                    templatesData = [response.data.data];
                }
            }
            
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error loading templates:', error);
            message.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Handle create template
    const handleCreateTemplate = async (templateData) => {
        try {
            const response = await templateService.createTemplate(templateData);
            if (response.data) {
                message.success('Template created successfully');
                setCreateModalVisible(false);
                loadTemplates();
            }
        } catch (error) {
            console.error('Error creating template:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create template';
            message.error(errorMsg);
        }
    };


    // Handle edit template
    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setEditModalVisible(true);
    };

    const handleUpdateTemplate = async (templateData) => {
        if (!editingTemplate) return;
        
        try {
            const response = await templateService.updateTemplate(editingTemplate.id, templateData);
            if (response.data) {
                message.success('Template updated successfully');
                setEditModalVisible(false);
                setEditingTemplate(null);
                loadTemplates();
            }
        } catch (error) {
            console.error('Error updating template:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update template';
            message.error(errorMsg);
        }
    };

    // Handle delete template
    const handleDeleteTemplate = async (templateId) => {
        try {
            await templateService.deleteTemplate(templateId);
            message.success('Template deleted successfully');
            loadTemplates();
            // Notify parent component to reload templates
            if (onTemplateDeleted) {
                onTemplateDeleted();
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete template';
            message.error(errorMsg);
        }
    };


    // Table columns
    const columns = [
        {
            title: 'Template Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                    {record.isDefault && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            Default
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || <Text type="secondary">No description</Text>,
        },
        {
            title: 'Assigned Phase',
            dataIndex: 'assignedPhaseId',
            key: 'assignedPhaseId',
            render: (phaseId, record) => {
                if (phaseId) {
                    const phase = phases.find(p => p.id === phaseId);
                    return phase ? (
                        <Tag color={phase.color}>{phase.name}</Tag>
                    ) : (
                        <Tag>Phase ID: {phaseId}</Tag>
                    );
                }
                return <Tag color="default">Default Template</Tag>;
            },
        },
        {
            title: 'Optional Fields',
            dataIndex: 'optionalFields',
            key: 'optionalFields',
            render: (fields) => (
                <Space wrap>
                    {fields && fields.length > 0 ? (
                        fields.map(field => (
                            <Tag key={field} color="cyan">{field}</Tag>
                        ))
                    ) : (
                        <Text type="secondary">None</Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit Template">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditTemplate(record)}
                        >
                            Edit
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete Template"
                        description="Are you sure you want to delete this template?"
                        onConfirm={() => handleDeleteTemplate(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Template">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            >
                                Delete
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="template-management">
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            Project Templates
                        </Title>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadTemplates}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setCreateModalVisible(true)}
                            >
                                Create Template
                            </Button>
                        </Space>
                    </div>
                }
                style={{ borderRadius: '12px' }}
            >
                {loading && templates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : templates.length === 0 ? (
                    <Empty
                        description="No templates available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Create Your First Template
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={templates}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} templates`,
                        }}
                        loading={loading}
                    />
                )}
            </Card>

            {/* Create Template Modal */}
            <CreateTemplateModal
                visible={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                }}
                onOk={handleCreateTemplate}
                phases={phases}
            />

            {/* Edit Template Modal */}
            {editingTemplate && (
                <CreateTemplateModal
                    visible={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setEditingTemplate(null);
                    }}
                    onOk={handleUpdateTemplate}
                    initialValues={editingTemplate}
                    isEdit={true}
                />
            )}

        </div>
    );
};

export default TemplateManagement;
