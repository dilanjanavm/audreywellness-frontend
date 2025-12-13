// src/Components/Common/modal/Permission/CreatePermissionModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import { Key, FileText, Folder } from "react-feather";

const { Option } = Select;
const { TextArea } = Input;

const CreatePermissionModal = ({
    visible,
    onClose,
    onCreate,
    loading = false,
    modules = [],
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleSubmit = (values) => {
        const submitData = {
            ...values,
            code: values.code?.toUpperCase().replace(/\s+/g, "_"),
        };
        onCreate(submitData);
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    // Common modules if none exist
    const commonModules = [
        "users",
        "tasks",
        "costing",
        "customers",
        "suppliers",
        "items",
        "categories",
        "orders",
        "payments",
        "settings",
    ];

    const availableModules = modules.length > 0 ? modules : commonModules;

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <Key size={20} className="me-2" />
                    Create New Permission
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
            className="create-permission-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Permission Name */}
                <Form.Item
                    label="Permission Name"
                    name="name"
                    rules={[
                        { required: true, message: "Please enter permission name" },
                        { min: 2, message: "Permission name must be at least 2 characters" },
                    ]}
                >
                    <Input
                        prefix={<Key size={16} />}
                        placeholder="e.g., Create User"
                        size="large"
                    />
                </Form.Item>

                <Row gutter={16}>
                    {/* Permission Code */}
                    <Col span={12}>
                        <Form.Item
                            label="Permission Code"
                            name="code"
                            rules={[
                                { required: true, message: "Please enter permission code" },
                                {
                                    pattern: /^[A-Z_]+$/,
                                    message: "Code must be uppercase letters and underscores only",
                                },
                            ]}
                            tooltip="Format: MODULE_ACTION (e.g., USER_CREATE, TASK_UPDATE)"
                        >
                            <Input
                                placeholder="e.g., USER_CREATE"
                                size="large"
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase().replace(/\s+/g, "_");
                                    form.setFieldsValue({ code: value });
                                }}
                            />
                        </Form.Item>
                    </Col>

                    {/* Module */}
                    <Col span={12}>
                        <Form.Item
                            label="Module"
                            name="module"
                            rules={[
                                { required: true, message: "Please select a module" },
                            ]}
                        >
                            <Select
                                placeholder="Select module"
                                size="large"
                                showSearch
                                allowClear
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {availableModules.map((module) => (
                                    <Option key={module} value={module}>
                                        {module}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Description */}
                <Form.Item label="Description" name="description">
                    <TextArea
                        rows={3}
                        placeholder="Enter permission description"
                        prefix={<FileText size={16} />}
                    />
                </Form.Item>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <Button size="large" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        className="px-4"
                    >
                        Create Permission
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreatePermissionModal;

