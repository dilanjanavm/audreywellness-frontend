import React from 'react';
import { Card, Typography, Button, Dropdown } from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import StatusColumn from './StatusColumn';
import { getAllStatuses } from './services/kanbanService';
import { TASK_STATUS } from './types';

const { Title } = Typography;

const PhaseColumn = ({ 
  phase, 
  organizedData, 
  onTaskClick, 
  onAddTask,
  onEditPhase,
  onDeletePhase 
}) => {
  const statuses = getAllStatuses();
  const phaseData = organizedData[phase.id];

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit Phase',
      onClick: () => onEditPhase && onEditPhase(phase),
    },
    {
      key: 'delete',
      label: 'Delete Phase',
      danger: true,
      onClick: () => onDeletePhase && onDeletePhase(phase.id),
    },
  ];

  if (!phaseData) return null;

  return (
    <div
      className="phase-column"
      style={{
        minWidth: '350px',
        maxWidth: '350px',
        marginRight: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        minHeight: '600px',
      }}
    >
      {/* Phase Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#fafafa',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div className="d-flex align-items-center">
          <div
            style={{
              width: '4px',
              height: '24px',
              backgroundColor: phase.color || '#1890ff',
              borderRadius: '2px',
              marginRight: '12px',
            }}
          />
          <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
            {phase.name}
          </Title>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
          />
        </Dropdown>
      </div>

      {/* Status Columns Container - Horizontal Scroll */}
      <div
        style={{
          padding: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          flex: 1,
          display: 'flex',
          gap: '8px',
        }}
        className="status-columns-container"
      >
        {statuses.map((statusItem) => {
          const tasks = phaseData.statuses[statusItem.id] || [];
          return (
            <StatusColumn
              key={statusItem.id}
              status={statusItem.id}
              tasks={tasks}
              phaseId={phase.id}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>

      {/* Add Task Button */}
      <div style={{ padding: '12px', borderTop: '1px solid #e8e8e8' }}>
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => onAddTask && onAddTask(phase.id)}
        >
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default PhaseColumn;

