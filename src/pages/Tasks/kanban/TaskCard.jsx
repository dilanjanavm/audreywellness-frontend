import React from 'react';
import { Card, Tag, Avatar, Space, Dropdown } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ClockCircleOutlined, 
  UserOutlined,
  MessageOutlined,
  EyeOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from './types';
import dayjs from 'dayjs';

const TaskCard = ({ task, onView, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id || task.id, // Use _id for drag-and-drop (should be same as id)
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const getPriorityLabel = (priority) => {
    return TASK_PRIORITY_LABELS[priority] || priority;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return dayjs(date).format('MMM DD, YYYY');
  };

  // Format numbers (e.g., 108000 -> 108k)
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const menuItems = [
    {
      key: 'view',
      label: (
        <Space size={8}>
          <EyeOutlined />
          <span>View task</span>
        </Space>
      ),
    },
    {
      key: 'edit',
      label: (
        <Space size={8}>
          <EditOutlined />
          <span>Update</span>
        </Space>
      ),
    },
    {
      key: 'delete',
      danger: true,
      label: (
        <Space size={8}>
          <DeleteOutlined />
          <span>Delete</span>
        </Space>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'view' && onView) {
      onView(task);
    } else if (key === 'edit' && onEdit) {
      onEdit(task);
    } else if (key === 'delete' && onDelete) {
      onDelete(task);
    }
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onView && onView(task)}
    >
      <Card
        size="small"
        className="mb-3 task-card-modern"
        style={{
          borderRadius: '12px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        hoverable
        bodyStyle={{ padding: '16px' }}
      >
        {/* Tags at top */}
        <div className="mb-3 d-flex justify-content-between align-items-start">
          <Tag 
            color={TASK_STATUS_COLORS[task.status] || 'default'}
            style={{ 
              borderRadius: '6px',
              border: 'none',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {task.statusLabel || task.status}
          </Tag>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: menuItems,
              onClick: (info) => {
                info.domEvent.stopPropagation();
                handleMenuClick(info);
              },
            }}
          >
            <button
              type="button"
              className="btn btn-link p-0 border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
            </button>
          </Dropdown>
        </div>

        {/* Task Title */}
        <h6 
          className="mb-2" 
          style={{ 
            fontSize: '15px', 
            fontWeight: 600,
            lineHeight: '1.4',
            color: '#1a1a1a',
            minHeight: '42px',
          }}
        >
          {task.task || task.title || 'Untitled Task'}
        </h6>

        {/* Description */}
        <p 
          className="mb-3" 
          style={{ 
            fontSize: '13px', 
            color: '#8c8c8c',
            lineHeight: '1.5',
            margin: 0,
            minHeight: '40px',
          }}
        >
          {task.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
        </p>

        {/* Due date & priority */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center" style={{ fontSize: 12, color: '#8c8c8c' }}>
            <ClockCircleOutlined className="me-1" />
            {task.dueDate || 'No due date'}
          </div>
          <Tag
            color={TASK_PRIORITY_COLORS[task.priority] || 'default'}
            style={{ borderRadius: 12, margin: 0 }}
          >
            {getPriorityLabel(task.priority)}
          </Tag>
        </div>

        {/* Assignees */}
        <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
          <div className="d-flex align-items-center flex-wrap" style={{ gap: '8px' }}>
            {task.assignees && task.assignees.length > 0 ? (
              <>
                {task.assignees.slice(0, 2).map((assignee, idx) => (
                  <div key={assignee.id || idx} className="d-flex align-items-center">
                    <Avatar
                      size="small"
                      src={
                        assignee?.avatar
                          ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}`
                          : undefined
                      }
                      icon={!assignee?.avatar ? <UserOutlined /> : undefined}
                      style={{ marginRight: 4 }}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {assignee?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                ))}
                {task.assignees.length > 2 && (
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                    +{task.assignees.length - 2}
                  </div>
                )}
              </>
            ) : task.assignee ? (
              <div className="d-flex align-items-center">
                <Avatar
                  size="small"
                  src={
                    task.assignee?.avatar
                      ? `${process.env.REACT_APP_API_URL || ''}/images/users/${task.assignee.avatar}`
                      : task.subItem?.[0]?.img
                        ? `${process.env.REACT_APP_API_URL || ''}/images/users/${task.subItem[0].img}`
                        : undefined
                  }
                  icon={!task.assignee && !task.subItem?.length ? <UserOutlined /> : undefined}
                  style={{ marginRight: 8 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {task.assignee?.name || task.subItem?.[0]?.name || 'Unassigned'}
                  </div>
                  {task.assignee?.role && (
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{task.assignee.role}</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Unassigned</div>
            )}
          </div>
        </div>

        {/* Comments and Views */}
        <Space size="middle">
          <div className="d-flex align-items-center" style={{ fontSize: '12px', color: '#8c8c8c' }}>
            <MessageOutlined className="me-1" />
            <span>{formatNumber(task.comments || task.commentCount || 0)}</span>
          </div>
          <div className="d-flex align-items-center" style={{ fontSize: '12px', color: '#8c8c8c' }}>
            <EyeOutlined className="me-1" />
            <span>{formatNumber(task.views || task.viewCount || 0)}</span>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TaskCard;
