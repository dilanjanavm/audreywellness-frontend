// src/components/complaint/ComplaintDetailsModal.js
import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Rate, Button, Form, Input, Card, Avatar } from 'antd';
import { User, Calendar, MessageCircle, AlertTriangle, Mail, Phone } from 'react-feather';

const { TextArea } = Input;

const ComplaintDetailsModal = ({ visible, complaint, onClose, onAddNote, addingNote }) => {
    const [noteForm] = Form.useForm();

    const handleAddNote = (values) => {
        onAddNote(values.note);
        noteForm.resetFields();
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

    const getPriorityColor = (priority) => {
        const colorMap = {
            low: 'green',
            medium: 'orange',
            high: 'red',
            critical: 'purple'
        };
        return colorMap[priority] || 'default';
    };

    if (!complaint) return null;

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <AlertTriangle size={20} className="me-2" />
                    Complaint Details - {complaint.complaintNumber}
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            className="complaint-details-modal"
        >
            <div className="row">
                <div className="col-md-8">
                    {/* Complaint Information */}
                    <Card title="Complaint Information" className="mb-4" size="small">
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Complaint Number" span={1}>
                                <Tag color="blue">{complaint.complaintNumber}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status" span={1}>
                                <Tag color={getStatusColor(complaint.status)}>
                                    {complaint.status.replace('_', ' ').toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Headline" span={2}>
                                {complaint.headline}
                            </Descriptions.Item>
                            <Descriptions.Item label="Category" span={1}>
                                <Tag>{complaint.category.replace('_', ' ').toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Priority" span={1}>
                                <Tag color={getPriorityColor(complaint.priority)}>
                                    {complaint.priority.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                <div
                                    className="complaint-description"
                                    dangerouslySetInnerHTML={{ __html: complaint.description }}
                                />
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Customer Information */}
                    <Card title="Customer Information" className="mb-4" size="small">
                        <div className="d-flex align-items-start mb-3">
                            <Avatar
                                size={50}
                                style={{ backgroundColor: '#1890ff', marginRight: '12px' }}
                                icon={<User size={20} />}
                            />
                            <div className="flex-grow-1">
                                <h6 className="mb-1">{complaint.customer?.fullName}</h6>
                                <div className="text-muted small mb-2">
                                    <Tag color="green" className="me-2">{complaint.customer?.customerCode}</Tag>
                                </div>
                                <div className="d-flex flex-wrap gap-3">
                                    <div className="d-flex align-items-center">
                                        <Mail size={14} className="me-1 text-muted" />
                                        <span className="small">{complaint.customer?.email}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <Phone size={14} className="me-1 text-muted" />
                                        <span className="small">{complaint.customer?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Add Note Section */}
                    <Card title={
                        <div className="d-flex align-items-center">
                            <MessageCircle size={16} className="me-2" />
                            Add Note
                        </div>
                    } className="mb-4" size="small">
                        <Form form={noteForm} onFinish={handleAddNote}>
                            <Form.Item name="note" rules={[{ required: true, message: 'Please enter a note' }]}>
                                <TextArea rows={3} placeholder="Enter your note here..." />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={addingNote}>
                                Add Note
                            </Button>
                        </Form>
                    </Card>
                </div>

                <div className="col-md-4">
                    {/* Timeline */}
                    <Card title={
                        <div className="d-flex align-items-center">
                            <Calendar size={16} className="me-2" />
                            Timeline
                        </div>
                    } className="mb-4" size="small">
                        <Timeline>
                            {complaint.timelineEntries?.map((entry) => (
                                <Timeline.Item key={entry.id} color={getStatusColor(complaint.status)}>
                                    <div className="timeline-entry">
                                        <div className="fw-semibold small text-capitalize">
                                            {entry.entryType.replace('_', ' ')}
                                        </div>
                                        <div className="text-muted small mb-1">{entry.description}</div>
                                        <div className="text-muted smaller">
                                            <div>By: {entry.createdBy?.username}</div>
                                            <div>{new Date(entry.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>

                    {/* Assignment & Dates */}
                    <Card title="Assignment & Dates" className="mb-4" size="small">
                        <div className="space-y-3">
                            <div>
                                <strong className="text-muted small">Assigned To:</strong>
                                <div className="mt-1">
                                    {complaint.assignedTo ? (
                                        <div className="d-flex align-items-center">
                                            <Avatar
                                                size={24}
                                                style={{ backgroundColor: '#52c41a', marginRight: '8px' }}
                                            >
                                                {complaint.assignedTo.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <span>{complaint.assignedTo.username}</span>
                                        </div>
                                    ) : (
                                        <Tag color="default">Unassigned</Tag>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong className="text-muted small">Target Resolution:</strong>
                                <div className="mt-1">
                                    {complaint.targetResolutionDate ? (
                                        <div className="d-flex align-items-center">
                                            <Calendar size={14} className="me-1 text-muted" />
                                            {new Date(complaint.targetResolutionDate).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <Tag color="orange">Not set</Tag>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong className="text-muted small">Actual Resolution:</strong>
                                <div className="mt-1">
                                    {complaint.actualResolutionDate ? (
                                        <div className="d-flex align-items-center">
                                            <Calendar size={14} className="me-1 text-success" />
                                            {new Date(complaint.actualResolutionDate).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <Tag color="blue">Pending</Tag>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong className="text-muted small">Created:</strong>
                                <div className="mt-1 d-flex align-items-center">
                                    <Calendar size={14} className="me-1 text-muted" />
                                    {new Date(complaint.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Customer Feedback */}
                    {complaint.clientFeedback && (
                        <Card title="Customer Feedback" className="mb-4" size="small">
                            <div className="feedback-section">
                                <div className="d-flex align-items-start mb-3">
                                    <Avatar
                                        size={40}
                                        style={{ backgroundColor: '#722ed1', marginRight: '12px' }}
                                        icon={<User size={16} />}
                                    />
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{complaint.customer?.fullName}</h6>
                                        <div className="text-muted small mb-2">
                                            {complaint.closedAt && `Submitted on ${new Date(complaint.closedAt).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="feedback-content mb-3">
                                    <div className="text-muted small mb-2">Feedback:</div>
                                    <div className="p-3 bg-light rounded">
                                        {complaint.clientFeedback}
                                    </div>
                                </div>

                                {complaint.feedbackRating && (
                                    <div className="rating-section">
                                        <div className="text-muted small mb-2">Rating:</div>
                                        <div className="d-flex align-items-center">
                                            <Rate
                                                disabled
                                                value={complaint.feedbackRating}
                                                className="me-2"
                                            />
                                            <span className="text-muted small">
                                                ({complaint.feedbackRating}/5)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ComplaintDetailsModal;