import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message, Spin, Radio } from 'antd';
import { SwapOutlined, CheckCircleOutlined } from '@ant-design/icons';
import * as phaseService from '../../../service/phaseService';

const { TextArea } = Input;
const { Option } = Select;

const MoveTaskPhaseModal = ({ visible, onCancel, onOk, task, phases, currentPhaseId }) => {
  const [form] = Form.useForm();
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [availablePhases, setAvailablePhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [moveDecision, setMoveDecision] = useState(null); // 'yes' or 'no'

  // Load phases when modal opens
  useEffect(() => {
    if (visible) {
      loadPhases();
      setMoveDecision(null);
      form.resetFields();
    } else {
      form.resetFields();
      setSelectedPhase(null);
      setMoveDecision(null);
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
      form.setFieldsValue({ toStatus: defaultStatus });
    }
  };

  const handleOk = async () => {
    if (moveDecision === 'no') {
      // User chose not to move, pass null to indicate "no move"
      onOk(null);
      return;
    }

    if (moveDecision === 'yes') {
      // User wants to move, validate and proceed
      try {
        const values = await form.validateFields();
        
        setSubmitting(true);
        
        // Get current user for movedBy
        const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
        const currentUserId = currentUser.user?.id || currentUser.user?._id || currentUser.id || currentUser._id;
        const currentUserName = currentUser.user?.userName || currentUser.user?.name || currentUser.userName || currentUser.name || 'Unknown';
        
        const movementData = {
          toPhaseId: values.toPhaseId,
          toStatus: values.toStatus || 'pending',
          reason: values.reason || `Task completed in ${phases.find(p => p.id === currentPhaseId)?.name || 'current phase'}, moving to ${selectedPhase?.name || 'target phase'}`,
          movedBy: currentUserId || currentUserName,
        };
        
        await onOk(movementData);
        
        form.resetFields();
        setSelectedPhase(null);
        setMoveDecision(null);
      } catch (error) {
        if (error.errorFields) {
          // Validation error
          return;
        }
        console.error('Error in move task modal:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPhase(null);
    setMoveDecision(null);
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
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Task Completed - Move to Another Phase?</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText={moveDecision === 'yes' ? "Move Task" : moveDecision === 'no' ? "Keep in Current Phase" : "Next"}
      cancelText="Cancel"
      confirmLoading={submitting}
      okButtonProps={{ 
        icon: moveDecision === 'yes' ? <SwapOutlined /> : null,
        disabled: moveDecision === null
      }}
    >
      {task && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Task: {task.task}
          </div>
          <div style={{ fontSize: 12, color: '#595959' }}>
            Current Phase: <strong>{currentPhase?.name || 'N/A'}</strong> | 
            Status: <strong style={{ color: '#52c41a' }}>Completed</strong>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>
          This task is now completed. Would you like to move it to another phase?
        </div>
        
        <Radio.Group 
          value={moveDecision} 
          onChange={(e) => setMoveDecision(e.target.value)}
          style={{ width: '100%' }}
        >
          <Radio value="yes" style={{ display: 'block', marginBottom: 12, padding: '8px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Yes, move to another phase</div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                Select a target phase to continue the workflow
              </div>
            </div>
          </Radio>
          <Radio value="no" style={{ display: 'block', padding: '8px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>No, keep it in current phase</div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                Task will remain in "{currentPhase?.name || 'current phase'}" phase with completed status
              </div>
            </div>
          </Radio>
        </Radio.Group>
      </div>

      {moveDecision === 'yes' && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            toStatus: 'pending',
          }}
        >
          <Form.Item
            label="Target Phase"
            name="toPhaseId"
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
            name="toStatus"
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
            label="Reason (Optional)"
            name="reason"
            tooltip="Add any notes about why this task is being moved"
          >
            <TextArea
              rows={3}
              placeholder={`e.g., Task completed in ${currentPhase?.name || 'current phase'}, moving to next phase`}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default MoveTaskPhaseModal;

