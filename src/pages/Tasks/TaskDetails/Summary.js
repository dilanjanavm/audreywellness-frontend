import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { Tag, Avatar, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const Summary = ({ task }) => {
    if (!task) {
        return (
            <Card>
                <CardBody>
                    <div className="text-muted">
                        <h6 className="mb-3 fw-semibold text-uppercase">Summary</h6>
                        <p>No task data available</p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'default',
            ongoing: 'blue',
            review: 'orange',
            completed: 'green',
            failed: 'red',
        };
        return colors[status] || 'default';
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
                    <div className="text-muted">
                        <h6 className="mb-3 fw-semibold text-uppercase">Task Summary</h6>
                        <h5 className="mb-3" style={{ color: '#212529' }}>{task.task || 'Untitled Task'}</h5>
                        <p style={{ color: '#495057', fontSize: '14px', lineHeight: '1.6' }}>
                            {task.description || 'No description provided.'}
                        </p>

                        <Divider style={{ margin: '16px 0' }} />

                        <div className="mb-3">
                            <h6 className="mb-2 fw-semibold text-uppercase">Task Information</h6>
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Task ID:</span>
                                    <span>{task.taskId || task.id || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Status:</span>
                                    <Tag color={getStatusColor(task.status)}>
                                        {(task.status || '').toUpperCase()}
                                    </Tag>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Priority:</span>
                                    <Tag color={getPriorityColor(task.priority)}>
                                        {getPriorityLabel(task.priority)}
                                    </Tag>
                                </div>
                                {task.dueDate && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-medium">Due Date:</span>
                                        <span>{dayjs(task.dueDate).format('MMM DD, YYYY')}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Created:</span>
                                    <span>{dayjs(task.createdAt).format('MMM DD, YYYY')}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Last Updated:</span>
                                    <span>{dayjs(task.updatedAt).format('MMM DD, YYYY')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Assigned User */}
                        {(task.assignedUser || task.assignee) && (
                            <>
                                <Divider style={{ margin: '16px 0' }} />
                                <div className="mb-3">
                                    <h6 className="mb-2 fw-semibold text-uppercase">Assigned To</h6>
                                    <div className="d-flex align-items-center gap-2">
                                        <Avatar
                                            src={
                                                (task.assignedUser?.avatar || task.assignee?.avatar)
                                                    ? `${process.env.REACT_APP_API_URL || ''}/images/users/${task.assignedUser?.avatar || task.assignee?.avatar}`
                                                    : undefined
                                            }
                                            icon={!task.assignedUser?.avatar && !task.assignee?.avatar ? <UserOutlined /> : undefined}
                                            size={40}
                                        />
                                        <div>
                                            <div className="fw-medium">
                                                {task.assignedUser?.userName || task.assignedUser?.name || task.assignee?.name || 'Unknown'}
                                            </div>
                                            {(task.assignedUser?.email || task.assignee?.email) && (
                                                <div className="text-muted" style={{ fontSize: '12px' }}>
                                                    {task.assignedUser?.email || task.assignee?.email}
                                                </div>
                                            )}
                                            {(task.assignee?.role || task.assignedUser?.role) && (
                                                <div className="text-muted" style={{ fontSize: '12px' }}>
                                                    {task.assignee?.role || task.assignedUser?.role?.name || 'Team Member'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Associated Product */}
                        {task.costing && (
                            <>
                                <Divider style={{ margin: '16px 0' }} />
                                <div className="mb-3">
                                    <h6 className="mb-2 fw-semibold text-uppercase">Associated Product</h6>
                                    <div>
                                        <div className="fw-medium mb-1">
                                            {task.costing.itemName || 'Unnamed Product'}
                                        </div>
                                        {task.costing.itemCode && (
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                Code: {task.costing.itemCode}
                                            </div>
                                        )}
                                        {task.costing.version && (
                                            <Tag color="blue" style={{ marginTop: 4 }}>
                                                Version {task.costing.version}
                                            </Tag>
                                        )}
                                        {task.batchSize && (
                                            <div style={{ marginTop: 8 }}>
                                                <span className="fw-medium">Batch Size: </span>
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
                                </div>
                            </>
                        )}

                        {/* Raw Materials */}
                        {task.rawMaterials && Array.isArray(task.rawMaterials) && task.rawMaterials.length > 0 && (
                            <>
                                <Divider style={{ margin: '16px 0' }} />
                                <div className="mb-3">
                                    <h6 className="mb-2 fw-semibold text-uppercase">Raw Materials Required</h6>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table className="table table-sm mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Material</th>
                                                    <th className="text-end">%</th>
                                                    <th className="text-end">Amount</th>
                                                    <th className="text-end">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {task.rawMaterials.map((material, index) => (
                                                    <tr key={material.rawMaterialId || index}>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{material.rawMaterialName || 'N/A'}</div>
                                                                {material.category && (
                                                                    <div className="text-muted" style={{ fontSize: '11px' }}>
                                                                        {material.category}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-end">
                                                            {parseFloat(material.percentage || 0).toFixed(2)}%
                                                        </td>
                                                        <td className="text-end">
                                                            {parseFloat(material.kg || 0).toFixed(2)} {material.units || 'kg'}
                                                        </td>
                                                        <td className="text-end fw-medium">
                                                            LKR {parseFloat(material.cost || 0).toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="table-primary">
                                                    <td colSpan={3} className="text-end fw-bold">
                                                        Total Cost:
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        LKR {task.rawMaterials
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
                            </>
                        )}

                        {/* Activity Stats */}
                        <Divider style={{ margin: '16px 0' }} />
                        <div>
                            <h6 className="mb-2 fw-semibold text-uppercase">Activity</h6>
                            <div className="d-flex gap-3">
                                <div>
                                    <span className="text-muted">Comments: </span>
                                    <span className="fw-medium">{task.comments || 0}</span>
                                </div>
                                <div>
                                    <span className="text-muted">Views: </span>
                                    <span className="fw-medium">{task.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export default Summary;
