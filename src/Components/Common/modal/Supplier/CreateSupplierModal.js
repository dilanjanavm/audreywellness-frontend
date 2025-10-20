// src/components/supplier/CreateSupplierModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Switch, Divider } from 'antd';
import { User, Phone, Mail, MapPin, CreditCard, FileText, DollarSign } from 'react-feather';
import * as itemService from "../../../../service/itemService";

const { Option } = Select;
const { TextArea } = Input;

const CreateSupplierModal = ({ visible, onClose, onCreate, loading = false }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadItems();
            form.setFieldsValue({
                currency: 'LKR',
                isActive: true
            });
        }
    }, [visible]);

    const loadItems = async () => {
        try {
            setItemsLoading(true);
            const response = await itemService.getAllItems();
            console.log(response.data)
            setItems(response.data || []);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setItemsLoading(false);
        }
    };

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
                    Create New Supplier
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={700}
            className="create-supplier-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Basic Information */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Supplier Name"
                            name="name"
                            rules={[
                                { required: true, message: 'Please enter supplier name' },
                                { min: 2, message: 'Name must be at least 2 characters' }
                            ]}
                        >
                            <Input
                                prefix={<User size={16} />}
                                placeholder="Enter supplier name"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Reference"
                            name="reference"
                            rules={[
                                { required: true, message: 'Please enter reference' },
                                { min: 2, message: 'Reference must be at least 2 characters' }
                            ]}
                        >
                            <Input
                                placeholder="Enter unique reference"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Contact Information */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Contact Person"
                            name="contactPerson"
                        >
                            <Input
                                placeholder="Enter contact person name"
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
                                placeholder="contact@example.com"
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
                            rules={[
                                { required: true, message: 'Please enter phone number' }
                            ]}
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
                            label="Secondary Phone"
                            name="phone2"
                        >
                            <Input
                                prefix={<Phone size={16} />}
                                placeholder="+94 77 123 4567"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address */}
                <Form.Item
                    label="Address"
                    name="address"
                    rules={[
                        { required: true, message: 'Please enter address' },
                        { min: 5, message: 'Address must be at least 5 characters' }
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter complete address"
                        prefix={<MapPin size={16} />}
                    />
                </Form.Item>

                <Divider>Additional Information</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Fax"
                            name="fax"
                        >
                            <Input
                                placeholder="Enter fax number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Currency"
                            name="currency"
                        >
                            <Select placeholder="Select currency" size="large">
                                <Option value="LKR">LKR - Sri Lankan Rupee</Option>
                                <Option value="USD">USD - US Dollar</Option>
                                <Option value="EUR">EUR - Euro</Option>
                                <Option value="GBP">GBP - British Pound</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="NTN Number"
                            name="ntnNumber"
                        >
                            <Input
                                prefix={<CreditCard size={16} />}
                                placeholder="Enter NTN number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="GST Number"
                            name="gstNumber"
                        >
                            <Input
                                prefix={<CreditCard size={16} />}
                                placeholder="Enter GST number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Payment Terms"
                            name="paymentTerms"
                        >
                            <Input
                                placeholder="e.g., Net 30, Net 60"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Tax Group"
                            name="taxGroup"
                        >
                            <Input
                                placeholder="Enter tax group"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider>Items & Status</Divider>

                {/* Items Selection */}
                <Form.Item
                    label="Associated Items"
                    name="itemIds"
                >
                    <Select
                        mode="multiple"
                        placeholder="Select items supplied by this supplier"
                        size="large"
                        loading={itemsLoading}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {items.map(item => (
                            <Option key={item.id} value={item.id}>
                                {item.itemCode} - {item.description}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Status */}
                <Form.Item
                    label="Status"
                    name="isActive"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        defaultChecked
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
                        Create Supplier
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateSupplierModal;