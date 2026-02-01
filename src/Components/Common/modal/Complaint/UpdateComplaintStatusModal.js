import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Alert, Tag, Checkbox, Card, message } from 'antd';
import { AlertTriangle, MessageCircle, Send } from 'react-feather';
import { sendComplaintSMS } from '../../../../service/complaintService';

const { Option } = Select;
const { TextArea } = Input;

// All available complaint statuses
const ALL_COMPLAINT_STATUSES = [
    'open',
    'in_progress',
    'resolved',
    'awaiting_feedback',
    'closed',
    'reopened'
];

const UpdateComplaintStatusModal = ({
    visible,
    complaint,
    onClose,
    onUpdateStatus,
    loading = false
}) => {
    const [form] = Form.useForm();
    const [sendingSms, setSendingSms] = useState(false);

    const handleSubmit = (values) => {
        const { smsSend, smsPhone, smsMessage, ...rest } = values;
        // Decoupled: SMS is sent via button, status update via main button.
        onUpdateStatus(rest);
    };

    const handleSendSms = async () => {
        try {
            const values = await form.validateFields(['smsPhone', 'smsMessage']);
            setSendingSms(true);
            await sendComplaintSMS(complaint.id, {
                phoneNumber: values.smsPhone,
                message: values.smsMessage
            });
            message.success('SMS sent to customer successfully');
            setSendingSms(false);
        } catch (error) {
            console.error(error);
            setSendingSms(false);
            if (!error.errorFields) {
                message.error('Failed to send SMS');
            }
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const getStatusColor = (status) => {
        const colorMap = {
            open: 'blue',
            in_progress: 'orange',
            resolved: 'green',
            awaiting_feedback: 'gold',
            closed: 'gray',
            reopened: 'red'
        };
        return colorMap[status] || 'default';
    };

    const getStatusDisplayName = (status) => {
        const displayMap = {
            open: 'Open',
            in_progress: 'In Progress',
            resolved: 'Resolved',
            awaiting_feedback: 'Awaiting Feedback',
            closed: 'Closed',
            reopened: 'Reopened'
        };
        return displayMap[status] || status;
    };

    if (!complaint) return null;

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <AlertTriangle size={20} className="me-2" />
                    Update Complaint Status
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
            className="update-complaint-status-modal"
        >
            {/* Current Complaint Info */}
            <Alert
                message="Complaint Information"
                description={
                    <div className="mt-2">
                        <div><strong>Complaint #:</strong> {complaint.complaintNumber}</div>
                        <div><strong>Headline:</strong> {complaint.headline}</div>
                        <div>
                            <strong>Current Status:</strong>{' '}
                            <Tag color={getStatusColor(complaint.status)}>
                                {getStatusDisplayName(complaint.status).toUpperCase()}
                            </Tag>
                        </div>
                    </div>
                }
                type="info"
                showIcon
                className="mb-4"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                initialValues={{
                    status: complaint.status // Default to current status
                }}
            >
                {/* Status Selection - Show all statuses */}
                <Form.Item
                    label="New Status"
                    name="status"
                    rules={[{ required: true, message: 'Please select a status' }]}
                >
                    <Select placeholder="Select new status" size="large">
                        {ALL_COMPLAINT_STATUSES.map(status => (
                            <Option key={status} value={status}>
                                <div className="d-flex align-items-center">
                                    <Tag
                                        color={getStatusColor(status)}
                                        style={{ marginRight: '8px', minWidth: '120px' }}
                                    >
                                        {getStatusDisplayName(status).toUpperCase()}
                                    </Tag>
                                    {status === complaint.status && (
                                        <span className="text-muted small">(Current)</span>
                                    )}
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Action Note */}
                <Form.Item
                    label={
                        <div className="d-flex align-items-center">
                            <MessageCircle size={16} className="me-2" />
                            Action Note (Required)
                        </div>
                    }
                    name="note"
                    rules={[
                        { required: true, message: 'Please enter a note explaining the status change' },
                        { min: 10, message: 'Note must be at least 10 characters long' }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Please provide details about why you are changing the status. This note will be added to the complaint timeline."
                    />
                </Form.Item>

                {/* SMS Notification Section */}
                <div className="mb-4 p-3 bg-light rounded border">
                    <Form.Item name="smsSend" valuePropName="checked" noStyle>
                        <Checkbox onChange={(e) => {
                            // Trigger re-render to show/hide fields
                            // Force update is handled by Form.useWatch or simply by Antd Form dependencies usually, 
                            // but since we are inside a functional component, we might rely on shouldUpdate or a separate state.
                            // Let's use Form.Item noStyle with shouldUpdate wrapper below.
                        }}>
                            <strong>Do you want to inform this to customer? (Send SMS)</strong>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.smsSend !== currentValues.smsSend}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('smsSend') ? (
                                <div className="mt-3 ps-3 border-start border-primary border-3">
                                    <h6 className="mb-3 d-flex align-items-center text-primary">
                                        <MessageCircle size={14} className="me-2" />
                                        Send SMS
                                    </h6>

                                    <div className="mb-3 p-2 bg-white rounded border small text-muted">
                                        Customer: <strong>{complaint.customer?.name}</strong>
                                    </div>

                                    <Form.Item
                                        label="Contact Number"
                                        name="smsPhone"
                                        rules={[{ required: true, message: 'Phone number is required for SMS' }]}
                                        initialValue={complaint.customer?.smsPhone || complaint.customer?.phone}
                                    >
                                        <Input prefix="+94" placeholder="771234567" />
                                    </Form.Item>

                                    <Form.Item
                                        label="SMS Message"
                                        name="smsMessage"
                                        rules={[{ required: true, message: 'Please enter SMS message' }]}
                                        initialValue={`Dear Customer, your complaint (${complaint.complaintNumber}) status has been updated. Thank you.`}
                                    >
                                        <TextArea rows={3} showCount maxLength={160} />
                                    </Form.Item>

                                    <div className="text-end">
                                        <Button
                                            type="primary"
                                            ghost
                                            size="small"
                                            onClick={handleSendSms}
                                            loading={sendingSms}
                                            icon={<Send size={14} className="me-1" />}
                                        >
                                            Inform Customer
                                        </Button>
                                    </div>
                                </div>
                            ) : null
                        }
                    </Form.Item>
                </div>

                {/* Dynamic warnings based on selected status */}
                {form.getFieldValue('status') === 'resolved' && complaint.status !== 'resolved' && (
                    <Alert
                        message="Resolution Confirmation"
                        description="Marking this complaint as resolved will notify the customer and request their feedback."
                        type="warning"
                        showIcon
                        className="mb-3"
                    />
                )}

                {form.getFieldValue('status') === 'closed' && complaint.status !== 'closed' && (
                    <Alert
                        message="Closing Complaint"
                        description="This will permanently close the complaint. Please ensure all issues are fully resolved."
                        type="warning"
                        showIcon
                        className="mb-3"
                    />
                )}

                {form.getFieldValue('status') === 'reopened' && complaint.status !== 'reopened' && (
                    <Alert
                        message="Reopening Complaint"
                        description="This complaint will be reopened for further investigation or action."
                        type="info"
                        showIcon
                        className="mb-3"
                    />
                )}

                {form.getFieldValue('status') === complaint.status && (
                    <Alert
                        message="No Status Change"
                        description="You have selected the current status. The note will still be added to the complaint timeline."
                        type="info"
                        showIcon
                        className="mb-3"
                    />
                )}

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <Button
                        size="large"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        className="px-4"
                    >
                        Update Status
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateComplaintStatusModal;