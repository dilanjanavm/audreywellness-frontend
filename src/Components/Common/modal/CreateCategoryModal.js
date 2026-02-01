// src/components/category/CreateCategoryModal.js
import React from 'react';
import { Modal, Form, Input, Button, ColorPicker, Row, Col } from 'antd';
import { Tag, FileText } from 'react-feather';

const { TextArea } = Input;

const CreateCategoryModal = ({ visible, onClose, onCreate, loading = false }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onCreate(values);
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
                    Create New Category
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={500}
            className="create-category-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Category ID */}
                <Form.Item
                    label="Category ID"
                    name="categoryId"
                    rules={[
                        { required: true, message: 'Please enter category ID' },
                        { min: 2, message: 'Category ID must be at least 2 characters' }
                    ]}
                >
                    <Input
                        prefix={<Tag size={16} />}
                        placeholder="e.g., CAT-001"
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
                        Create Category
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCategoryModal;