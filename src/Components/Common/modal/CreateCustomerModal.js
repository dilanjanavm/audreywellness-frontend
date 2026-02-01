// src/Components/Common/modal/CreateCustomerModal.js
import React from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, DatePicker } from 'antd';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Compass,
    Hash,
    Map,
    Calendar,
    Users
} from 'react-feather';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

// Enum values matching your backend
const SALES_TYPES = {
    RETAIL: 'Retail',
    WHOLESALE: 'Wholesale',
    CORPORATE: 'Corporate'
};

const PAYMENT_TERMS = {
    COD_IML: 'COD-IML',
    SEVEN_DAYS: '7 Days',
    FIFTEEN_DAYS: '15 Days',
    THIRTY_DAYS: '30 Days'
};

const STATUS_TYPES = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended'
};

const CUSTOMER_TYPES = {
    INDIVIDUAL: 'Individual',
    BUSINESS: 'Business'
};

const CreateCustomerModal = ({ visible, onClose, onCreate, loading = false }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        // Format the DOB date before submitting
        const formattedValues = {
            ...values,
            dob: values.dob ? values.dob.format('YYYY-MM-DD') : null
        };
        onCreate(formattedValues);
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
            width={800}
            className="create-customer-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                initialValues={{
                    currency: 'LKR',
                    salesType: 'Retail',
                    paymentTerms: 'COD-IML',
                    status: 'Active',
                    customerType: 'INDIVIDUAL'
                }}
            >
                {/* Row 1: S_No and Name */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="S/No"
                            name="sNo"
                            rules={[
                                { required: true, message: 'Please enter S/No' }
                            ]}
                        >
                            <Input
                                prefix={<Hash size={16} />}
                                placeholder="e.g., 001"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[
                                { required: true, message: 'Please enter customer name' },
                                { min: 2, message: 'Name must be at least 2 characters' }
                            ]}
                        >
                            <Input
                                prefix={<User size={16} />}
                                placeholder="Enter full business/customer name"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 2: Short Name and Branch Name */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Short Name"
                            name="shortName"
                            rules={[
                                { required: true, message: 'Please enter short name' }
                            ]}
                        >
                            <Input
                                placeholder="Short identifier"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Branch Name"
                            name="branchName"
                            rules={[
                                { required: true, message: 'Please enter branch name' }
                            ]}
                        >
                            <Input
                                prefix={<Map size={16} />}
                                placeholder="Branch name"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 3: City/Area and Email */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="City/Area"
                            name="cityArea"
                            rules={[
                                { required: true, message: 'Please enter city/area' }
                            ]}
                        >
                            <Input
                                prefix={<Compass size={16} />}
                                placeholder="e.g., Colombo, Galle"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
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

                {/* Row 4: SMS Phone and Currency */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="SMS Phone"
                            name="smsPhone"
                            rules={[
                                { required: true, message: 'Please enter SMS phone number' }
                            ]}
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="e.g., 771234567"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Currency"
                            name="currency"
                            rules={[
                                { required: true, message: 'Please select currency' }
                            ]}
                        >
                            <Select placeholder="Select currency" size="large">
                                <Option value="LKR">LKR - Sri Lankan Rupee</Option>
                                <Option value="USD">USD - US Dollar</Option>
                                <Option value="EUR">EUR - Euro</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 5: Sales Type and Payment Terms */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Sales Type"
                            name="salesType"
                            rules={[
                                { required: true, message: 'Please select sales type' }
                            ]}
                        >
                            <Select placeholder="Select sales type" size="large">
                                {Object.entries(SALES_TYPES).map(([key, value]) => (
                                    <Option key={key} value={value}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Payment Terms"
                            name="paymentTerms"
                            rules={[
                                { required: true, message: 'Please select payment terms' }
                            ]}
                        >
                            <Select placeholder="Select payment terms" size="large">
                                {Object.entries(PAYMENT_TERMS).map(([key, value]) => (
                                    <Option key={key} value={value}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 6: DOB and Status */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Date of Birth/Establishment"
                            name="dob"
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                size="large"
                                format="DD/MM/YYYY"
                                placeholder="Select date"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[
                                { required: true, message: 'Please select status' }
                            ]}
                        >
                            <Select placeholder="Select status" size="large">
                                {Object.entries(STATUS_TYPES).map(([key, value]) => (
                                    <Option key={key} value={value}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 7: Sales Group and Customer Type */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Sales Group"
                            name="salesGroup"
                            rules={[
                                { required: true, message: 'Please enter sales group' }
                            ]}
                        >
                            <Input
                                prefix={<Users size={16} />}
                                placeholder="e.g., Hospitality - Retail"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Customer Type"
                            name="customerType"
                            rules={[
                                { required: true, message: 'Please select customer type' }
                            ]}
                        >
                            <Select placeholder="Select customer type" size="large">
                                {Object.entries(CUSTOMER_TYPES).map(([key, value]) => (
                                    <Option key={key} value={key}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address Field */}
                <Form.Item
                    label="Address"
                    name="address"
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter complete address"
                        style={{ resize: 'none' }}
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
                        Create Customer
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCustomerModal;