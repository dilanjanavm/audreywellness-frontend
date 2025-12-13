import React from 'react';
import { Modal, Form, Input, ColorPicker, message, Select } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getAllStatuses } from './services/kanbanService';

const { TextArea } = Input;
const statusOptions = getAllStatuses();

const AddPhaseModal = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();

  const validationSchema = Yup.object({
    name: Yup.string().required('Phase name is required'),
    color: Yup.string(),
    statuses: Yup.array().min(1, 'Select at least one status'),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      color: '#1890ff',
      statuses: statusOptions.map((status) => status.id),
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const colorValue =
        typeof values.color === 'string'
          ? values.color
          : values.color?.toHexString() || '#1890ff';
      onOk({
        ...values,
        color: colorValue,
        statuses: values.statuses || [],
        description: values.description || '',
      });
      formik.resetForm();
      form.resetFields();
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      formik.setValues({
        ...formik.values,
        ...initialValues,
        statuses: initialValues.statuses && initialValues.statuses.length
          ? initialValues.statuses
          : statusOptions.map((status) => status.id),
      });
      form.setFieldsValue({
        ...initialValues,
        statuses: initialValues.statuses && initialValues.statuses.length
          ? initialValues.statuses
          : statusOptions.map((status) => status.id),
      });
    }
  }, [initialValues]);

  const handleOk = async () => {
    try {
      await form.validateFields();
      formik.handleSubmit();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleCancel = () => {
    formik.resetForm();
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
        onValuesChange={(changedValues, allValues) => {
          Object.keys(changedValues).forEach((key) => {
            if (key === 'color' && typeof changedValues[key] !== 'string') {
              formik.setFieldValue(key, changedValues[key]?.toHexString() || '#1890ff');
            } else {
              formik.setFieldValue(key, allValues[key]);
            }
          });
        }}
      >
        <Form.Item
          label="Phase Name"
          name="name"
          rules={[{ required: true, message: 'Please enter phase name' }]}
        >
          <Input
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="e.g., Blending, Filling & Packing"
          />
        </Form.Item>

        <Form.Item label="Color" name="color">
          <ColorPicker
            value={formik.values.color}
            onChange={(color) => formik.setFieldValue('color', color)}
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
            value={formik.values.statuses}
            onChange={(value) => formik.setFieldValue('statuses', value)}
            placeholder="Select statuses to display"
            options={statusOptions.map((status) => ({
              label: status.label,
              value: status.id,
            }))}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            value={formik.values.description}
            onChange={formik.handleChange}
            placeholder="Describe this phase"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPhaseModal;

