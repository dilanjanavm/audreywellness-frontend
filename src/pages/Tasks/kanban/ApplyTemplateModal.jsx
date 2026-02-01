import React, { useState, useEffect } from 'react';
import { Modal, Form, Radio, Alert, Space, Typography, Card, Tag } from 'antd';
import { FileTextOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ApplyTemplateModal = ({ visible, onCancel, onOk, template, existingPhasesCount = 0 }) => {
    const [form] = Form.useForm();
    const [replaceMode, setReplaceMode] = useState('append');

    useEffect(() => {
        if (visible && template) {
            form.setFieldsValue({
                replaceExisting: false,
                keepTasks: true,
            });
            setReplaceMode('append');
        }
    }, [visible, template, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const options = {
                replaceExisting: replaceMode === 'replace',
                keepTasks: values.keepTasks !== false,
            };
            await onOk(options);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    if (!template) return null;

    return (
        <Modal
            title="Apply Template"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            width={600}
            okText="Apply Template"
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Template Info */}
                    <Card size="small" style={{ background: '#f0f7ff' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Space>
                                <FileTextOutlined style={{ color: '#1890ff' }} />
                                <Text strong>{template.name}</Text>
                                {template.isDefault && (
                                    <Tag color="green" icon={<CheckCircleOutlined />}>
                                        Default
                                    </Tag>
                                )}
                            </Space>
                            {template.description && (
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                    {template.description}
                                </Text>
                            )}
                            <div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    This template contains <strong>{template.phases?.length || 0} phases</strong>
                                </Text>
                            </div>
                        </Space>
                    </Card>

                    {/* Phases Preview */}
                    {template.phases && template.phases.length > 0 && (
                        <div>
                            <Text strong style={{ marginBottom: 8, display: 'block' }}>
                                Template Phases:
                            </Text>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {template.phases.map((phase, index) => (
                                    <div key={index} style={{ 
                                        padding: '8px 12px', 
                                        background: '#fafafa', 
                                        borderRadius: '6px',
                                        border: `1px solid ${phase.color || '#1890ff'}20`
                                    }}>
                                        <Space>
                                            <Tag color={phase.color || '#1890ff'}>
                                                {phase.name}
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {phase.statuses?.length || 0} statuses
                                            </Text>
                                        </Space>
                                    </div>
                                ))}
                            </Space>
                        </div>
                    )}

                    {/* Warning if phases exist */}
                    {existingPhasesCount > 0 && (
                        <Alert
                            message="Existing Phases Detected"
                            description={`You currently have ${existingPhasesCount} phase(s). Choose how to apply this template.`}
                            type="warning"
                            icon={<WarningOutlined />}
                            showIcon
                        />
                    )}

                    {/* Replace Mode Selection */}
                    <Form.Item
                        label="Apply Mode"
                        name="replaceMode"
                        rules={[{ required: true, message: 'Please select apply mode' }]}
                    >
                        <Radio.Group 
                            value={replaceMode} 
                            onChange={(e) => setReplaceMode(e.target.value)}
                        >
                            <Space direction="vertical">
                                <Radio value="append">
                                    <Space direction="vertical" size={0}>
                                        <Text strong>Append Phases</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Add template phases to existing phases
                                        </Text>
                                    </Space>
                                </Radio>
                                <Radio value="replace">
                                    <Space direction="vertical" size={0}>
                                        <Text strong>Replace All Phases</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Replace existing phases with template phases
                                        </Text>
                                    </Space>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    {/* Keep Tasks Option */}
                    {replaceMode === 'replace' && (
                        <Form.Item
                            label="Keep Existing Tasks"
                            name="keepTasks"
                            valuePropName="checked"
                        >
                            <Radio.Group>
                                <Radio value={true}>Yes - Move tasks to first phase</Radio>
                                <Radio value={false}>No - Remove tasks (not recommended)</Radio>
                            </Radio.Group>
                        </Form.Item>
                    )}

                    {replaceMode === 'replace' && (
                        <Alert
                            message="Warning"
                            description="Replacing phases will remove existing phase configurations. Existing tasks will be moved to the first phase if 'Keep Tasks' is enabled."
                            type="warning"
                            showIcon
                        />
                    )}
                </Space>
            </Form>
        </Modal>
    );
};

export default ApplyTemplateModal;
