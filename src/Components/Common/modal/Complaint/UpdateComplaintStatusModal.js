// src/components/complaint/UpdateComplaintStatusModal.js
import React from 'react';
import { Modal, Form, Input, Select, Button, Alert, Tag } from 'antd';
import { AlertTriangle, MessageCircle } from 'react-feather';

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

    const handleSubmit = (values) => {
        onUpdateStatus(values);
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