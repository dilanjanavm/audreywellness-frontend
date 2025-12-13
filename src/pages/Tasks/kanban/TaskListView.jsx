import React, { useState } from 'react';
import { Table, Avatar, Tag, Space, Button, Dropdown, Menu, Empty } from 'antd';
import { MoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TASK_STATUS_LABELS } from './types';

const TaskListView = ({ 
    phases, 
    organizedData, 
    activeTab, 
    onViewTask, 
    onTaskEdit, 
    onTaskDelete, 
    onAddTask,
    getAllStatuses 
}) => {
    const [expandedStatuses, setExpandedStatuses] = useState({});

    const statuses = getAllStatuses();
    const selectedPhase = phases.find(p => p.id === activeTab);
    const phaseData = organizedData[activeTab] || {};

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            pending: '#d9d9d9',
            ongoing: '#722ed1',
            review: '#fa8c16',
            completed: '#52c41a',
            failed: '#ff4d4f',
        };
        return colors[status] || '#1890ff';
    };

    // Toggle status section
    const toggleStatus = (status) => {
        setExpandedStatuses(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            low: 'default',
            medium: 'blue',
            high: 'orange',
            urgent: 'red',
        };
        return colors[priority] || 'default';
    };

    // Get priority label
    const getPriorityLabel = (priority) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent',
        };
        return labels[priority] || priority || '-';
    };

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'task',
            key: 'task',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(record.status),
                            flexShrink: 0,
                        }}
                    />
                    <span 
                        style={{ cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => onViewTask(record)}
                    >
                        {text || 'Untitled Task'}
                    </span>
                    {record.comments > 0 && (
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {record.comments}
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: 'Assignee',
            dataIndex: 'assignees',
            key: 'assignee',
            render: (assignees) => {
                if (!assignees || assignees.length === 0) {
                    return (
                        <Avatar 
                            icon={<UserOutlined />} 
                            style={{ backgroundColor: '#d9d9d9' }}
                        />
                    );
                }
                return (
                    <Avatar.Group maxCount={2} size="small">
                        {assignees.map((assignee, idx) => (
                            <Avatar
                                key={assignee.id || idx}
                                src={assignee.avatar ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}` : undefined}
                                style={{ backgroundColor: assignee.avatar ? undefined : '#1890ff' }}
                            >
                                {!assignee.avatar && (assignee.name || assignee.userName || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                        ))}
                    </Avatar.Group>
                );
            },
        },
        {
            title: 'Due date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => {
                if (!date) {
                    return (
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<PlusOutlined />}
                            style={{ color: '#8c8c8c' }}
                        >
                            Add
                        </Button>
                    );
                }
                return dayjs(date).format('MMM DD, YYYY');
            },
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                if (!priority) {
                    return <span style={{ color: '#8c8c8c' }}>-</span>;
                }
                return (
                    <Tag color={getPriorityColor(priority)}>
                        {getPriorityLabel(priority)}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: (
                            <span onClick={() => onViewTask(record)}>
                                View Details
                            </span>
                        ),
                    },
                    {
                        key: 'edit',
                        label: (
                            <span onClick={() => onTaskEdit(record)}>
                                <EditOutlined style={{ marginRight: 8 }} />
                                Edit
                            </span>
                        ),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'delete',
                        label: (
                            <span 
                                style={{ color: '#ff4d4f' }}
                                onClick={() => onTaskDelete(record)}
                            >
                                <DeleteOutlined style={{ marginRight: 8 }} />
                                Delete
                            </span>
                        ),
                        danger: true,
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    if (!selectedPhase) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Empty description="No phase selected" />
            </div>
        );
    }

    const phaseStatuses = selectedPhase.statuses || statuses.map(s => s.id);

    return (
        <div style={{ padding: '20px 0' }}>
            {phaseStatuses.map((status) => {
                const tasks = phaseData.statuses?.[status] || [];
                const isExpanded = expandedStatuses[status] !== false; // Default to expanded
                const statusLabel = TASK_STATUS_LABELS[status] || status.toUpperCase();
                const statusColor = getStatusColor(status);

                return (
                    <div key={status} style={{ marginBottom: 24 }}>
                        {/* Status Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                                padding: '8px 12px',
                                backgroundColor: '#fafafa',
                                borderRadius: 4,
                                border: `1px solid ${statusColor}20`,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s',
                                            }}
                                        >
                                            ▶
                                        </span>
                                    }
                                    onClick={() => toggleStatus(status)}
                                    style={{ padding: 0, width: 20, height: 20 }}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '4px 12px',
                                        borderRadius: 12,
                                        backgroundColor: `${statusColor}15`,
                                        border: `1px solid ${statusColor}40`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: statusColor,
                                        }}
                                    />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
                                        {statusLabel}
                                    </span>
                                </div>
                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                                    {tasks.length}
                                </span>
                            </div>
                            <Space>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<MoreOutlined />}
                                />
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => onAddTask(status)}
                                >
                                    Add Task
                                </Button>
                            </Space>
                        </div>

                        {/* Tasks Table */}
                        {isExpanded && (
                            <div style={{ marginLeft: 32 }}>
                                {tasks.length > 0 ? (
                                    <Table
                                        columns={columns}
                                        dataSource={tasks}
                                        rowKey={(record) => record.id || record._id}
                                        pagination={false}
                                        size="small"
                                        style={{
                                            backgroundColor: '#fff',
                                            borderRadius: 4,
                                        }}
                                        onRow={(record) => ({
                                            onClick: () => onViewTask(record),
                                            style: { cursor: 'pointer' },
                                        })}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            backgroundColor: '#fafafa',
                                            borderRadius: 4,
                                            border: '1px dashed #d9d9d9',
                                        }}
                                    >
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => onAddTask(status)}
                                        >
                                            Add Task
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TaskListView;

