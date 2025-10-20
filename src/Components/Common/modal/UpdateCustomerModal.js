import React from "react";
import {Modal, Row, Col, Form, Input, Select, Button, Tag} from "antd";
import { User, Mail, Phone, MapPin,  Globe } from "react-feather";

const { Option } = Select;
const { TextArea } = Input;

const UpdateCustomerModal = ({
                                 visible,
                                 customer,
                                 onClose,
                                 onUpdate,
                                 loading = false
                             }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (customer && visible) {
            form.setFieldsValue({
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                country: customer.country,
                status: customer.status,
            });
        }
    }, [customer, visible, form]);

    const handleSubmit = (values) => {
        onUpdate(values);
    };

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <User size={20} className="me-2" />
                    Update Customer
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            className="update-customer-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                <Row gutter={16}>
                    {/* Full Name */}
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

                    {/* Email */}
                    <Col span={12}>
                        <Form.Item
                            label="Email Address"
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
                    {/* Phone */}
                    <Col span={12}>
                        <Form.Item
                            label="Phone Number"
                            name="phone"
                            rules={[
                                { required: true, message: 'Please enter phone number' }
                            ]}
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="+1 234 567 8900"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Status */}
                    <Col span={12}>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status" size="large">
                                <Option value={1}>
                                    <Tag color="green">Active</Tag>
                                </Option>
                                <Option value={2}>
                                    <Tag color="red">Inactive</Tag>
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address */}
                <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please enter address' }]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter complete address"
                        prefix={<MapPin size={16} />}
                    />
                </Form.Item>

                <Row gutter={16}>
                    {/* City */}
                    <Col span={12}>
                        <Form.Item
                            label="City"
                            name="city"
                            rules={[{ required: true, message: 'Please enter city' }]}
                        >
                            <Input
                                prefix={<MapPin size={16} />}
                                placeholder="Enter city"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Country */}
                    <Col span={12}>
                        <Form.Item
                            label="Country"
                            name="country"
                            rules={[{ required: true, message: 'Please enter country' }]}
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
                        onClick={onClose}
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
                        Update Customer
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateCustomerModal;