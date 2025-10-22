// src/Components/Common/modal/CreateCustomerModal.js
import React from 'react';
import { Modal, Form, Input, Select, Button, Row, Col } from 'antd';
import { User, Mail, Phone, MapPin, Compass, Globe } from 'react-feather';

const { Option } = Select;
const { TextArea } = Input;

const CreateCustomerModal = ({ visible, onClose, onCreate, loading = false }) => {
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
                    <User size={20} className="me-2" />
                    Create New Customer
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
            className="create-customer-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[
                                { required: true, message: 'Please enter customer name' },
                                { min: 2, message: 'Name must be at least 2 characters' }
                            ]}
                        >
                            <Input
                                prefix={<User size={16} />}
                                placeholder="Enter full name"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Please enter valid email' }
                            ]}
                        >
                            <Input
                                prefix={<Mail size={16} />}
                                placeholder="customer@example.com"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[{ required: true, message: 'Please enter phone number' }]}
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="+94 77 123 4567"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Customer Type"
                            name="customerType"
                        >
                            <Select placeholder="Select customer type" size="large">
                                <Option value="INDIVIDUAL">Individual</Option>
                                <Option value="BUSINESS">Business</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Address"
                    name="address"
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter complete address"
                        prefix={<MapPin size={16} />}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="City"
                            name="city"
                        >
                            <Input
                                prefix={<Compass size={16} />}
                                placeholder="Enter city"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Country"
                            name="country"
                        >
                            <Input
                                prefix={<Globe size={16} />}
                                placeholder="Enter country"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

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
                        Create Customer
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCustomerModal;