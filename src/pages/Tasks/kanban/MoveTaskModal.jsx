import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message, Spin } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import * as phaseService from '../../../service/phaseService';

const { TextArea } = Input;
const { Option } = Select;

const MoveTaskModal = ({ visible, onCancel, onOk, task, phases, currentPhaseId }) => {
  const [form] = Form.useForm();
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [availablePhases, setAvailablePhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load phases when modal opens
  useEffect(() => {
    if (visible) {
      loadPhases();
    } else {
      form.resetFields();
      setSelectedPhase(null);
    }
  }, [visible]);

  const loadPhases = async () => {
    try {
      setLoadingPhases(true);
      // Use provided phases or fetch from API
      if (phases && phases.length > 0) {
        // Filter out current phase
        const filtered = phases.filter(p => p.id !== currentPhaseId);
        setAvailablePhases(filtered);
      } else {
        const response = await phaseService.getAllPhase(false);
        let phasesData = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            phasesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            phasesData = response.data.data;
          }
        }
        
        // Filter out current phase
        const filtered = phasesData.filter(p => (p.id || p._id) !== currentPhaseId);
        setAvailablePhases(filtered);
      }
    } catch (error) {
      console.error('Error loading phases:', error);
      message.error('Failed to load phases');
    } finally {
      setLoadingPhases(false);
    }
  };

  const handlePhaseChange = (phaseId) => {
    const phase = availablePhases.find(p => (p.id || p._id) === phaseId);
    setSelectedPhase(phase);
    
    // Set default status to "pending" for the new phase
    if (phase && phase.statuses && phase.statuses.length > 0) {
      const defaultStatus = phase.statuses.includes('pending') ? 'pending' : phase.statuses[0];
      form.setFieldsValue({ targetStatus: defaultStatus });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      setSubmitting(true);
      
      // Get current user for updatedBy
      const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
      const currentUserId = currentUser.user?.id || currentUser.user?._id || currentUser.id || currentUser._id;
      
      const movementData = {
        targetPhaseId: values.targetPhaseId,
        targetStatus: values.targetStatus || 'pending',
        notes: values.notes || '',
        updatedBy: currentUserId,
      };
      
      await onOk(movementData);
      
      form.resetFields();
      setSelectedPhase(null);
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      console.error('Error in move task modal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPhase(null);
    onCancel();
  };

  // Get available statuses for selected phase
  const getAvailableStatuses = () => {
    if (!selectedPhase) return [];
    
    const statuses = selectedPhase.statuses || [];
    const statusLabels = {
      'pending': 'Pending',
      'ongoing': 'Ongoing',
      'review': 'Review',
      'completed': 'Completed',
      'failed': 'Failed',
    };
    
    return statuses.map(status => ({
      value: status,
      label: statusLabels[status] || status,
    }));
  };

  const currentPhase = phases?.find(p => p.id === currentPhaseId) || null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SwapOutlined />
          <span>Move Task to Another Phase</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="Move Task"
      cancelText="Cancel"
      confirmLoading={submitting}
      okButtonProps={{ icon: <SwapOutlined /> }}
    >
      {task && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Task: {task.task}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            Current Phase: <strong>{currentPhase?.name || 'N/A'}</strong> | 
            Current Status: <strong>{task.status || 'N/A'}</strong>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          targetStatus: 'pending',
        }}
      >
        <Form.Item
          label="Target Phase"
          name="targetPhaseId"
          rules={[{ required: true, message: 'Please select a target phase' }]}
        >
          <Select
            placeholder="Select target phase"
            loading={loadingPhases}
            onChange={handlePhaseChange}
            notFoundContent={loadingPhases ? <Spin size="small" /> : 'No phases available'}
            showSearch
            filterOption={(input, option) =>
              (option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {availablePhases.map((phase) => (
              <Option key={phase.id || phase._id} value={phase.id || phase._id}>
                {phase.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Target Status"
          name="targetStatus"
          rules={[{ required: true, message: 'Please select a target status' }]}
        >
          <Select
            placeholder="Select status for new phase"
            disabled={!selectedPhase}
            notFoundContent={!selectedPhase ? 'Please select a phase first' : 'No statuses available'}
          >
            {getAvailableStatuses().map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Notes (Optional)"
          name="notes"
          tooltip="Add any notes about why this task is being moved"
        >
          <TextArea
            rows={3}
            placeholder="e.g., Manufacturing completed, ready for packing phase"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MoveTaskModal;

