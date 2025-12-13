import React from 'react';
import { Typography, Button } from 'antd';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { PlusOutlined } from '@ant-design/icons';
import TaskCard from './TaskCard';
import { TASK_STATUS_LABELS } from './types';

const { Text } = Typography;

const StatusColumn = ({ status, tasks, phaseId, onViewTask, onTaskEdit, onTaskDelete, onAddTask }) => {
  // Use a separator that won't conflict with UUIDs (which contain hyphens)
  const dropId = `status:${phaseId}:${status}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      type: 'status',
      status,
      phaseId,
    },
  });

  const taskIds = tasks.map((task) => task._id || task.id);
  const statusLabel = TASK_STATUS_LABELS[status] || status;

  // Get status color based on status type
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

  return (
    <div
      ref={setNodeRef}
      className="status-column-modern"
      style={{
        minWidth: '320px',
        maxWidth: '320px',
        marginRight: '16px',
        backgroundColor: isOver ? '#f0f7ff' : '#fafafa',
        borderRadius: '12px',
        padding: '16px',
        height: 'fit-content',
        minHeight: '500px',
        border: isOver ? '2px dashed #1890ff' : '1px solid #e8e8e8',
        transition: 'all 0.2s',
      }}
    >
      {/* Status Header */}
      <div 
        className="mb-3 d-flex justify-content-between align-items-center"
        style={{
          paddingBottom: '12px',
          borderBottom: '2px solid #e8e8e8',
        }}
      >
        <div className="d-flex align-items-center">
          <div
            style={{
              width: '4px',
              height: '20px',
              backgroundColor: getStatusColor(status),
              borderRadius: '2px',
              marginRight: '10px',
            }}
          />
          <Text 
            strong 
            style={{ 
              fontSize: '14px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {statusLabel}
          </Text>
        </div>
        <span
          style={{
            backgroundColor: getStatusColor(status),
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 600,
            minWidth: '28px',
            textAlign: 'center',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks List */}
      <div
        style={{
          maxHeight: 'calc(100vh - 350px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="status-tasks-container"
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onView={(t) => onViewTask && onViewTask(t)}
              onEdit={(t) => onTaskEdit && onTaskEdit(t)}
              onDelete={(t) => onTaskDelete && onTaskDelete(t)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#bfbfbf',
              fontSize: '13px',
            }}
          >
            <div className="mb-2">No tasks</div>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAddTask && onAddTask()}
              style={{ borderRadius: '6px' }}
            >
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Add Task Button (when tasks exist) */}
      {tasks.length > 0 && (
        <div className="mt-3">
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => onAddTask && onAddTask()}
            style={{ borderRadius: '6px' }}
          >
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default StatusColumn;
