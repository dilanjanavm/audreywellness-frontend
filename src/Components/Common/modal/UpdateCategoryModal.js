// src/components/category/UpdateCategoryModal.js
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, ColorPicker } from 'antd';
import { Tag, FileText } from 'react-feather';

const { TextArea } = Input;

const UpdateCategoryModal = ({
                               visible,
                               category,
                               onClose,
                               onUpdate,
                               loading = false
                             }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (category && visible) {
      form.setFieldsValue({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryDesc: category.categoryDesc,
        categoryColor: category.categoryColor,
      });
    }
  }, [category, visible, form]);

  const handleSubmit = (values) => {
    onUpdate(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
      <Modal
          title={
            <div className="d-flex align-items-center">
              <Tag size={20} className="me-2" />
              Update Category
            </div>
          }
          open={visible}
          onCancel={handleClose}
          footer={null}
          width={500}
          className="update-category-modal"
      >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark="optional"
        >
          {/* Category ID (Disabled for update) */}
          <Form.Item
              label="Category ID"
              name="categoryId"
          >
            <Input
                prefix={<Tag size={16} />}
                disabled
                size="large"
            />
          </Form.Item>

          {/* Category Name */}
          <Form.Item
              label="Category Name"
              name="categoryName"
              rules={[
                { required: true, message: 'Please enter category name' },
                { min: 2, message: 'Category name must be at least 2 characters' }
              ]}
          >
            <Input
                placeholder="Enter category name"
                size="large"
            />
          </Form.Item>

          {/* Category Description */}
          <Form.Item
              label="Description"
              name="categoryDesc"
              rules={[{ required: true, message: 'Please enter category description' }]}
          >
            <TextArea
                rows={3}
                placeholder="Enter category description"
                prefix={<FileText size={16} />}
            />
          </Form.Item>

          {/* Category Color */}
          <Form.Item
              label="Category Color"
              name="categoryColor"
              rules={[{ required: true, message: 'Please select a color' }]}
          >
            <ColorPicker
                size="large"
                showText
                format="hex"
                presets={[
                  {
                    label: 'Recommended',
                    colors: [
                      '#FF4D4F',
                      '#52C41A',
                      '#1890FF',
                      '#FAAD14',
                      '#722ED1',
                      '#13C2C2',
                      '#EB2F96',
                      '#FA541C',
                    ],
                  },
                ]}
            />
          </Form.Item>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
            <Button
                size="large"
                onClick={handleClose}
                disabled={loading}
            >
              Cancel
            </Button>
            <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="px-4"
            >
              Update Category
            </Button>
          </div>
        </Form>
      </Modal>
  );
};

export default UpdateCategoryModal;