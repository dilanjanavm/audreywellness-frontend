// src/Components/Common/modal/User/CreateUserModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Switch, InputNumber } from "antd";
import { User, Mail, Phone, MapPin, Calendar, Shield, Lock } from "react-feather";
import * as roleService from "../../../../service/roleService";

const { Option } = Select;
const { TextArea } = Input;

const CreateUserModal = ({
    visible,
    onClose,
    onCreate,
    loading = false,
    roles = [],
}) => {
    const [form] = Form.useForm();
    const [rolesList, setRolesList] = useState(roles);
    const [sendEmail, setSendEmail] = useState(true);

    useEffect(() => {
        if (visible) {
            loadRoles();
            form.resetFields();
            setSendEmail(true);
        }
    }, [visible, form]);

    const loadRoles = async () => {
        try {
            const response = await roleService.getAllRoles();
            const rolesData = response.data?.data || response.data || [];
            setRolesList(rolesData);
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    const handleSubmit = (values) => {
        const submitData = {
            ...values,
            sendEmail: sendEmail,
        };
        onCreate(submitData);
    };

    const handleClose = () => {
        form.resetFields();
        setSendEmail(true);
        onClose();
    };

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <User size={20} className="me-2" />
                    Create New User
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={800}
            className="create-user-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                <Row gutter={16}>
                    {/* User Name */}
                    <Col span={12}>
                        <Form.Item
                            label="User Name"
                            name="userName"
                            rules={[
                                { required: true, message: "Please enter user name" },
                                { min: 3, message: "User name must be at least 3 characters" },
                            ]}
                        >
                            <Input
                                prefix={<User size={16} />}
                                placeholder="Enter user name"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Email */}
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Please enter email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input
                                prefix={<Mail size={16} />}
                                placeholder="Enter email address"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Mobile Number */}
                    <Col span={12}>
                        <Form.Item
                            label="Mobile Number"
                            name="mobileNumber"
                            rules={[
                                {
                                    pattern: /^[0-9]+$/,
                                    message: "Please enter valid mobile number",
                                },
                            ]}
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="Enter mobile number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Contact Number */}
                    <Col span={12}>
                        <Form.Item
                            label="Contact Number"
                            name="contactNumber"
                            rules={[
                                {
                                    pattern: /^[0-9]+$/,
                                    message: "Please enter valid contact number",
                                },
                            ]}
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="Enter contact number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Age */}
                    <Col span={8}>
                        <Form.Item label="Age" name="age">
                            <InputNumber
                                style={{ width: "100%" }}
                                placeholder="Enter age"
                                size="large"
                                min={1}
                                max={150}
                            />
                        </Form.Item>
                    </Col>

                    {/* Gender */}
                    <Col span={8}>
                        <Form.Item label="Gender" name="gender">
                            <Select
                                placeholder="Select gender"
                                size="large"
                                allowClear
                            >
                                <Option value="MALE">Male</Option>
                                <Option value="FEMALE">Female</Option>
                                <Option value="OTHER">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Role */}
                    <Col span={8}>
                        <Form.Item label="Role" name="roleId">
                            <Select
                                placeholder="Select role"
                                size="large"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {rolesList.map((role) => (
                                    <Option key={role.id} value={role.id}>
                                        {role.name} ({role.code})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address */}
                <Form.Item label="Address" name="address">
                    <TextArea
                        rows={2}
                        placeholder="Enter address"
                        prefix={<MapPin size={16} />}
                    />
                </Form.Item>

                <Row gutter={16}>
                    {/* Password (Optional) */}
                    <Col span={12}>
                        <Form.Item
                            label="Password (Optional)"
                            name="password"
                            tooltip="If not provided, a temporary password will be generated"
                        >
                            <Input.Password
                                prefix={<Lock size={16} />}
                                placeholder="Enter password (optional)"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Send Email */}
                    <Col span={12}>
                        <Form.Item label="Send Email Notification">
                            <Switch
                                checked={sendEmail}
                                onChange={setSendEmail}
                                checkedChildren="Yes"
                                unCheckedChildren="No"
                            />
                            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: 4 }}>
                                Send credentials via email
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

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
                        Create User
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateUserModal;

