import React, { useState } from 'react';
import { Avatar, Tag, Space, Button, Dropdown, Empty, Typography, Divider } from 'antd';
import { 
    MoreOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    UserOutlined,
    CalendarOutlined,
    MessageOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { TASK_STATUS_LABELS } from './types';

const { Text } = Typography;

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
            pending: '#94a3b8',
            ongoing: '#6366f1',
            review: '#f59e0b',
            completed: '#10b981',
            failed: '#ef4444',
        };
        return colors[status] || '#3b82f6';
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
            low: { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
            medium: { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd' },
            high: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
            urgent: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
        };
        return colors[priority] || { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' };
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

    if (!selectedPhase) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Empty description="No phase selected" />
            </div>
        );
    }

    const phaseStatuses = selectedPhase.statuses || statuses.map(s => s.id);

    return (
        <div style={{ padding: '24px 0' }}>
            {phaseStatuses.map((status) => {
                const tasks = phaseData.statuses?.[status] || [];
                const isExpanded = expandedStatuses[status] !== false; // Default to expanded
                const statusLabel = TASK_STATUS_LABELS[status] || status.toUpperCase();
                const statusColor = getStatusColor(status);

                return (
                    <div key={status} style={{ marginBottom: 32 }}>
                        {/* Status Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 16,
                                padding: '12px 16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                                    onClick={() => toggleStatus(status)}
                                    style={{ 
                                        padding: '4px 8px',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor: statusColor,
                                            boxShadow: `0 0 0 3px ${statusColor}20`,
                                        }}
                                    />
                                    <Text strong style={{ fontSize: 14, color: '#111827' }}>
                                        {statusLabel}
                                    </Text>
                                </div>
                                <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                </Text>
                            </div>
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => onAddTask(status)}
                                style={{ 
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    boxShadow: 'none'
                                }}
                            >
                                Add Task
                            </Button>
                        </div>

                        {/* Tasks List */}
                        {isExpanded && (
                            <div style={{ marginLeft: 8 }}>
                                {tasks.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {tasks.map((task) => {
                                            const priorityColor = getPriorityColor(task.priority);
                                            const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
                                            
                                            return (
                                                <div
                                                    key={task.id || task._id}
                                                    onClick={() => onViewTask(task)}
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        padding: '16px 20px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#d1d5db';
                                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                                        {/* Left Section */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                                <Text 
                                                                    strong 
                                                                    style={{ 
                                                                        fontSize: 15, 
                                                                        color: '#111827',
                                                                        lineHeight: 1.4
                                                                    }}
                                                                >
                                                                    {task.task || 'Untitled Task'}
                                                                </Text>
                                                                {task.comments > 0 && (
                                                                    <div style={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: 4,
                                                                        color: '#6b7280',
                                                                        fontSize: 12
                                                                    }}>
                                                                        <MessageOutlined />
                                                                        <span>{task.comments}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Meta Information */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                                                {/* Assignees */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    {task.assignees && task.assignees.length > 0 ? (
                                                                        <Avatar.Group maxCount={3} size="small">
                                                                            {task.assignees.map((assignee, idx) => (
                                                                                <Avatar
                                                                                    key={assignee.id || idx}
                                                                                    src={assignee.avatar ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}` : undefined}
                                                                                    style={{ 
                                                                                        backgroundColor: assignee.avatar ? undefined : '#6366f1',
                                                                                        border: '2px solid #ffffff'
                                                                                    }}
                                                                                >
                                                                                    {!assignee.avatar && (assignee.name || assignee.userName || 'U').charAt(0).toUpperCase()}
                                                                                </Avatar>
                                                                            ))}
                                                                        </Avatar.Group>
                                                                    ) : (
                                                                        <div style={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            gap: 6,
                                                                            color: '#9ca3af',
                                                                            fontSize: 12
                                                                        }}>
                                                                            <UserOutlined />
                                                                            <span>Unassigned</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Due Date */}
                                                                {task.dueDate && (
                                                                    <div style={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: 6,
                                                                        color: isOverdue ? '#ef4444' : '#6b7280',
                                                                        fontSize: 12,
                                                                        fontWeight: isOverdue ? 500 : 400
                                                                    }}>
                                                                        <CalendarOutlined />
                                                                        <span>{dayjs(task.dueDate).format('MMM DD, YYYY')}</span>
                                                                    </div>
                                                                )}

                                                                {/* Priority */}
                                                                {task.priority && (
                                                                    <div
                                                                        style={{
                                                                            padding: '2px 10px',
                                                                            borderRadius: '12px',
                                                                            backgroundColor: priorityColor.bg,
                                                                            border: `1px solid ${priorityColor.border}`,
                                                                            fontSize: 11,
                                                                            fontWeight: 500,
                                                                            color: priorityColor.text,
                                                                            textTransform: 'capitalize'
                                                                        }}
                                                                    >
                                                                        {getPriorityLabel(task.priority)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right Section - Actions */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Dropdown
                                                                menu={{
                                                                    items: [
                                                                        {
                                                                            key: 'view',
                                                                            label: 'View Details',
                                                                            onClick: (e) => {
                                                                                e.domEvent.stopPropagation();
                                                                                onViewTask(task);
                                                                            }
                                                                        },
                                                                        {
                                                                            key: 'edit',
                                                                            label: (
                                                                                <span>
                                                                                    <EditOutlined style={{ marginRight: 8 }} />
                                                                                    Edit
                                                                                </span>
                                                                            ),
                                                                            onClick: (e) => {
                                                                                e.domEvent.stopPropagation();
                                                                                onTaskEdit(task);
                                                                            }
                                                                        },
                                                                        {
                                                                            type: 'divider',
                                                                        },
                                                                        {
                                                                            key: 'delete',
                                                                            label: (
                                                                                <span style={{ color: '#ef4444' }}>
                                                                                    <DeleteOutlined style={{ marginRight: 8 }} />
                                                                                    Delete
                                                                                </span>
                                                                            ),
                                                                            onClick: (e) => {
                                                                                e.domEvent.stopPropagation();
                                                                                onTaskDelete(task);
                                                                            },
                                                                            danger: true,
                                                                        },
                                                                    ],
                                                                }}
                                                                trigger={['click']}
                                                                placement="bottomRight"
                                                            >
                                                                <Button
                                                                    type="text"
                                                                    icon={<MoreOutlined />}
                                                                    size="small"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ 
                                                                        color: '#6b7280',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                />
                                                            </Dropdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            padding: '48px 24px',
                                            textAlign: 'center',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            border: '2px dashed #e5e7eb',
                                        }}
                                    >
                                        <Text style={{ color: '#9ca3af', fontSize: 14, display: 'block', marginBottom: 16 }}>
                                            No tasks in this status
                                        </Text>
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => onAddTask(status)}
                                            style={{ 
                                                borderRadius: '6px',
                                                borderColor: '#d1d5db',
                                                color: '#6b7280'
                                            }}
                                        >
                                            Add your first task
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

