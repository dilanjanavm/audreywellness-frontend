import React, { useEffect } from 'react';
import { Modal, Form, Input, ColorPicker, message, Select } from 'antd';
import { getAllStatuses } from './services/kanbanService';

const { TextArea } = Input;
const statusOptions = getAllStatuses();

const AddPhaseModal = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Edit mode - set form values
        const formValues = {
          ...initialValues,
          statuses: initialValues.statuses && initialValues.statuses.length
            ? initialValues.statuses
            : statusOptions.map((status) => status.id),
        };
        form.setFieldsValue(formValues);
      } else {
        // Add mode - reset to default values
        const defaultValues = {
          name: '',
          color: '#1890ff',
          statuses: statusOptions.map((status) => status.id),
          description: '',
        };
        form.setFieldsValue(defaultValues);
      }
    }
  }, [initialValues, visible, form]);

  const handleOk = async () => {
    try {
      // Validate and get form values
      const formValues = await form.validateFields();
      
      // Process color value
      const colorValue =
        typeof formValues.color === 'string'
          ? formValues.color
          : formValues.color?.toHexString() || '#1890ff';
      
      // Prepare phase data
      const phaseData = {
        name: formValues.name,
        color: colorValue,
        statuses: formValues.statuses || [],
        description: formValues.description || '',
      };
      
      // Call onOk callback with phase data
      await onOk(phaseData);
      
      // Reset form after successful submission
      form.resetFields();
    } catch (error) {
      console.error('Validation or submission error:', error);
      if (error.errorFields) {
        // Ant Design form validation error
        message.error('Please fill in all required fields correctly');
      } else {
        // API or other error
        message.error(error.message || 'Failed to save phase');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? 'Edit Phase' : 'Add New Phase'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={500}
      okText="Save"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Phase Name"
          name="name"
          rules={[{ required: true, message: 'Please enter phase name' }]}
        >
          <Input
            placeholder="e.g., Blending, Filling & Packing"
          />
        </Form.Item>

        <Form.Item label="Color" name="color">
          <ColorPicker
            showText
          />
        </Form.Item>

        <Form.Item
          label="Phase Statuses"
          name="statuses"
          rules={[{ required: true, message: 'Select at least one status' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select statuses to display"
            options={statusOptions.map((status) => ({
              label: status.label,
              value: status.id,
            }))}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            placeholder="Describe this phase"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPhaseModal;

