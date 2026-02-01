import React from 'react';
import { Card, CardBody } from "reactstrap";
import { Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const TimeTracking = ({ task }) => {
    if (!task) {
        return (
            <Card>
                <CardBody className="text-center">
                    <h6 className="card-title mb-3 flex-grow-1 text-start">Task Information</h6>
                    <p className="text-muted">No task data available</p>
                </CardBody>
            </Card>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: '#d9d9d9',
            ongoing: '#1890ff',
            review: '#fa8c16',
            completed: '#52c41a',
            failed: '#ff4d4f',
        };
        return colors[status] || '#1890ff';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'default',
            medium: 'blue',
            high: 'orange',
            urgent: 'red',
        };
        return colors[priority] || 'default';
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent',
        };
        return labels[priority] || priority || 'Not Set';
    };

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <h6 className="card-title mb-3 flex-grow-1 text-start">Task Information</h6>
                    
                    <div className="table-card">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className="fw-medium">Task ID</td>
                                    <td>{task.taskId || task.id || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">Task Title</td>
                                    <td>{task.task || 'Untitled Task'}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">Status</td>
                                    <td>
                                        <Tag color={getStatusColor(task.status)}>
                                            {(task.status || '').toUpperCase()}
                                        </Tag>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">Priority</td>
                                    <td>
                                        <Tag color={getPriorityColor(task.priority)}>
                                            {getPriorityLabel(task.priority)}
                                        </Tag>
                                    </td>
                                </tr>
                                {task.dueDate && (
                                    <tr>
                                        <td className="fw-medium">Due Date</td>
                                        <td>{dayjs(task.dueDate).format('MMM DD, YYYY')}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="fw-medium">Created</td>
                                    <td>{dayjs(task.createdAt).format('MMM DD, YYYY')}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">Last Updated</td>
                                    <td>{dayjs(task.updatedAt).format('MMM DD, YYYY')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Assigned User Card */}
            {(task.assignedUser || task.assignee) && (
                <Card className="mb-3">
                    <CardBody>
                        <h6 className="card-title mb-3 flex-grow-1 text-start">Assigned To</h6>
                        <div className="text-center">
                            <Avatar
                                src={
                                    (task.assignedUser?.avatar || task.assignee?.avatar)
                                        ? `${process.env.REACT_APP_API_URL || ''}/images/users/${task.assignedUser?.avatar || task.assignee?.avatar}`
                                        : undefined
                                }
                                icon={!task.assignedUser?.avatar && !task.assignee?.avatar ? <UserOutlined /> : undefined}
                                size={64}
                                style={{ marginBottom: 12 }}
                            />
                            <h5 className="mb-1">
                                {task.assignedUser?.userName || task.assignedUser?.name || task.assignee?.name || 'Unknown'}
                            </h5>
                            {(task.assignedUser?.email || task.assignee?.email) && (
                                <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
                                    {task.assignedUser?.email || task.assignee?.email}
                                </p>
                            )}
                            {(task.assignee?.role || task.assignedUser?.role) && (
                                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                                    {task.assignee?.role || task.assignedUser?.role?.name || 'Team Member'}
                                </p>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Associated Product Card */}
            {task.costing && (
                <Card className="mb-3">
                    <CardBody>
                        <h6 className="card-title mb-3 flex-grow-1 text-start">Associated Product</h6>
                        <div>
                            <h6 className="mb-2">{task.costing.itemName || 'Unnamed Product'}</h6>
                            {task.costing.itemCode && (
                                <p className="text-muted mb-2" style={{ fontSize: '13px' }}>
                                    Code: {task.costing.itemCode}
                                </p>
                            )}
                            {task.costing.version && (
                                <Tag color="blue" style={{ marginBottom: 8 }}>
                                    Version {task.costing.version}
                                </Tag>
                            )}
                            {task.batchSize && (
                                <div>
                                    <span className="text-muted" style={{ fontSize: '13px' }}>Batch Size: </span>
                                    <Tag color="green">
                                        {(() => {
                                            const batchSize = task.batchSize;
                                            const match = batchSize.match(/batch(\d+(?:\.\d+)?)kg/);
                                            if (match) {
                                                const kg = match[1].replace('_', '.');
                                                return `${kg} kg`;
                                            }
                                            return batchSize.replace('batch', '').replace(/([A-Z])/g, ' $1').trim();
                                        })()}
                                    </Tag>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}
        </React.Fragment>
    );
};

export default TimeTracking;
