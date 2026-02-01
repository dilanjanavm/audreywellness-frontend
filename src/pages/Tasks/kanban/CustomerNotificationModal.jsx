import React, { useState, useEffect } from 'react';
import { Modal, Radio, Space, Descriptions, Card, Typography, Button, Spin, message, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, ShoppingOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import * as smsService from '../../../service/smsService';
import * as taskService from '../../../service/taskService';
import * as customerService from '../../../service/customerService';

const { Text, Title } = Typography;

const CustomerNotificationModal = ({ 
    visible, 
    onCancel, 
    onConfirm, 
    task,
    loading = false 
}) => {
    const [sendSMS, setSendSMS] = useState(null); // null = not decided, true = yes, false = no
    const [sendingSMS, setSendingSMS] = useState(false);
    const [taskDetails, setTaskDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Helper function to check if a string is a UUID
    const isUUID = (str) => {
        if (!str || typeof str !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    // Fetch task details when modal opens
    useEffect(() => {
        const fetchTaskDetails = async () => {
            if (visible && task) {
                const taskId = task.id || task._id;
                if (!taskId) {
                    console.error('Task ID not found');
                    return;
                }

                setLoadingDetails(true);
                try {
                    const response = await taskService.getTaskDetails(taskId);
                    const details = response.data?.data || response.data;
                    
                    if (details?.task) {
                        let enrichedTask = details.task;
                        
                        // If customerName is a UUID, fetch customer details
                        if (enrichedTask.customerName && isUUID(enrichedTask.customerName)) {
                            try {
                                const customerResponse = await customerService.getCustomerById(enrichedTask.customerName);
                                const customerData = customerResponse.data?.data || customerResponse.data;
                                if (customerData) {
                                    enrichedTask = {
                                        ...enrichedTask,
                                        customerName: customerData.name || customerData.shortName || enrichedTask.customerName,
                                        customerEmail: customerData.email || null,
                                    };
                                }
                            } catch (error) {
                                console.error('Error fetching customer details:', error);
                            }
                        }
                        
                        setTaskDetails(enrichedTask);
                    }
                } catch (error) {
                    console.error('Error fetching task details:', error);
                    message.error('Failed to load task details');
                    // Fall back to the task prop if API call fails
                    setTaskDetails(task);
                } finally {
                    setLoadingDetails(false);
                }
            } else if (!visible) {
                // Reset when modal closes
                setTaskDetails(null);
                setSendSMS(null);
                setSendingSMS(false);
            }
        };

        fetchTaskDetails();
    }, [visible, task]);

    const handleConfirm = async () => {
        if (sendSMS === null) {
            message.warning('Please select whether to send SMS notification');
            return;
        }

        // Use taskDetails if available, otherwise fall back to task prop
        const currentTask = taskDetails || task;

        if (sendSMS === true && currentTask) {
            // Send SMS
            const phoneNumber = currentTask?.customerMobile || currentTask?.customerContact;
            if (!phoneNumber) {
                message.error('Customer phone number is not available');
                return;
            }

            setSendingSMS(true);
            try {
                await smsService.sendTaskStatusUpdateSMS({
                    taskId: currentTask?.id || currentTask?._id,
                    phoneNumber: phoneNumber,
                    taskName: currentTask?.task || currentTask?.name || 'Task',
                    status: currentTask?.status,
                    orderNumber: currentTask?.orderNumber,
                    customerName: currentTask?.customerName
                });
                message.success('SMS sent successfully');
            } catch (error) {
                console.error('Error sending SMS:', error);
                message.error(error.response?.data?.message || error.message || 'Failed to send SMS');
                // Still proceed with task update even if SMS fails
            } finally {
                setSendingSMS(false);
            }
        }

        // Proceed with task update
        onConfirm(sendSMS);
    };

    const handleCancel = () => {
        setSendSMS(null);
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <ShoppingOutlined style={{ color: '#1890ff' }} />
                    <span>Notify Customer About Task Update</span>
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={sendingSMS}>
                    Cancel
                </Button>,
                <Button 
                    key="confirm" 
                    type="primary" 
                    onClick={handleConfirm}
                    loading={sendingSMS}
                    disabled={sendSMS === null}
                >
                    {sendingSMS ? 'Sending SMS...' : 'Continue'}
                </Button>
            ]}
            maskClosable={false}
            closable={!sendingSMS}
        >
            <Spin spinning={loading || loadingDetails || sendingSMS}>
                <div style={{ padding: '8px 0' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ fontSize: 15 }}>
                            Do you want to inform the customer about this task status update?
                        </Text>
                    </div>

                    <Radio.Group 
                        value={sendSMS} 
                        onChange={(e) => setSendSMS(e.target.value)}
                        style={{ marginBottom: 24, width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio value={true} style={{ display: 'block', marginBottom: 8 }}>
                                <Space>
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Yes, send SMS notification to customer</span>
                                </Space>
                            </Radio>
                            <Radio value={false} style={{ display: 'block' }}>
                                <Space>
                                    <CloseOutlined style={{ color: '#8c8c8c' }} />
                                    <span>No, skip SMS notification</span>
                                </Space>
                            </Radio>
                        </Space>
                    </Radio.Group>

                    {/* Customer & Order Details Summary */}
                    {(taskDetails || task) && (
                        <Card 
                            title={
                                <Space>
                                    <ShoppingOutlined />
                                    <span>Customer & Order Details</span>
                                </Space>
                            }
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions column={1} size="small" colon={false}>
                                {(taskDetails || task)?.orderNumber && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <ShoppingOutlined />
                                            <span>Order Number</span>
                                        </Space>
                                    }>
                                        <Text strong>{(taskDetails || task).orderNumber}</Text>
                                    </Descriptions.Item>
                                )}
                                {(taskDetails || task)?.customerName && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <UserOutlined />
                                            <span>Customer Name</span>
                                        </Space>
                                    }>
                                        <Text strong>{(taskDetails || task).customerName}</Text>
                                    </Descriptions.Item>
                                )}
                                {((taskDetails || task)?.customerMobile || (taskDetails || task)?.customerContact) && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <PhoneOutlined />
                                            <span>Mobile Number</span>
                                        </Space>
                                    }>
                                        <Text strong>{(taskDetails || task).customerMobile || (taskDetails || task).customerContact}</Text>
                                    </Descriptions.Item>
                                )}
                                {(taskDetails || task)?.customerEmail && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <UserOutlined />
                                            <span>Email</span>
                                        </Space>
                                    }>
                                        <Text>{(taskDetails || task).customerEmail}</Text>
                                    </Descriptions.Item>
                                )}
                                {(taskDetails || task)?.customerAddress && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <HomeOutlined />
                                            <span>Address</span>
                                        </Space>
                                    }>
                                        <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{(taskDetails || task).customerAddress}</Text>
                                    </Descriptions.Item>
                                )}
                                {(taskDetails || task)?.courierNumber && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <ShoppingOutlined />
                                            <span>Courier Number</span>
                                        </Space>
                                    }>
                                        <Text strong>{(taskDetails || task).courierNumber}</Text>
                                    </Descriptions.Item>
                                )}
                                {(taskDetails || task)?.courierService && (
                                    <Descriptions.Item label={
                                        <Space>
                                            <ShoppingOutlined />
                                            <span>Courier Service</span>
                                        </Space>
                                    }>
                                        <Text strong>{(taskDetails || task).courierService}</Text>
                                    </Descriptions.Item>
                                )}
                                <Divider style={{ margin: '12px 0' }} />
                                <Descriptions.Item label="Task Name">
                                    <Text strong>{(taskDetails || task)?.task || (taskDetails || task)?.name || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Text strong style={{ 
                                        color: (taskDetails || task)?.status === 'completed' ? '#52c41a' : 
                                               (taskDetails || task)?.status === 'ongoing' ? '#1890ff' : 
                                               (taskDetails || task)?.status === 'review' ? '#faad14' : '#8c8c8c'
                                    }}>
                                        {(taskDetails || task)?.statusLabel || (taskDetails || task)?.status || 'N/A'}
                                    </Text>
                                </Descriptions.Item>
                                {(taskDetails || task)?.description && (
                                    <Descriptions.Item label="Description">
                                        <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{(taskDetails || task).description}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    )}

                    {sendSMS === true && (taskDetails || task) && ((taskDetails || task)?.customerMobile || (taskDetails || task)?.customerContact) && (
                        <div style={{ 
                            padding: '12px', 
                            background: '#e6f7ff', 
                            borderRadius: '6px',
                            border: '1px solid #91d5ff',
                            marginTop: 16
                        }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                An SMS will be sent to: <Text strong>{(taskDetails || task).customerMobile || (taskDetails || task).customerContact}</Text>
                            </Text>
                        </div>
                    )}
                </div>
            </Spin>
        </Modal>
    );
};

export default CustomerNotificationModal;
