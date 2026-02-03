// src/components/item/UpdateItemModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Row, Col } from 'antd';
import { Package, DollarSign, FileText, Hash, Columns } from 'react-feather';
import * as categoryService from "../../../../service/categoryService";
import { UNIT_TYPES } from "../../../../common/enum";

const { Option } = Select;
const { TextArea } = Input;

const UpdateItemModal = ({
    visible,
    item,
    onClose,
    onUpdate,
    loading = false
}) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadCategories();
            if (item) {
                form.setFieldsValue({
                    itemCode: item.itemCode,
                    stockId: item.stockId,
                    description: item.description,
                    categoryId: item.categoryId,
                    units: item.units,
                    price: item.price,
                    altPrice: item.altPrice,
                    currency: item.currency,
                    status: item.status,
                });
            }
        }
    }, [item, visible, form]);

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await categoryService.getAllCategories();
            // Response from apiService contains the data array directly in response.data
            // based on backend structure: { statusCode: 200, data: [...] }
            if (response && response.data) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

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
                    <Package size={20} className="me-2" />
                    Update Item
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={700}
            className="update-item-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Item Code and Stock ID */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Item Code"
                            name="itemCode"
                            rules={[{ required: true, message: 'Item code is required' }]}
                        >
                            <Input
                                prefix={<Hash size={16} />}
                                placeholder="Enter item code"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Stock ID"
                            name="stockId"
                            rules={[{ required: true, message: 'Stock ID is required' }]}
                        >
                            <Input
                                prefix={<Columns size={16} />}
                                placeholder="Enter stock ID"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Description */}
                <Form.Item
                    label="Item Name/Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter item description' }]}
                >
                    <Input
                        prefix={<FileText size={16} />}
                        placeholder="Enter item description"
                        size="large"
                    />
                </Form.Item>

                {/* Category and Units */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Category"
                            name="categoryId"
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select
                                placeholder="Select category"
                                size="large"
                                loading={categoriesLoading}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {categories.map(category => (
                                    <Option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Units"
                            name="units"
                            rules={[{ required: true, message: 'Please select units' }]}
                        >
                            <Select placeholder="Select units" size="large">
                                {UNIT_TYPES.map(unit => (
                                    <Option key={unit} value={unit}>{unit}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Pricing */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Unit Price"
                            name="price"
                            rules={[{ required: true, message: 'Please enter unit price' }]}
                        >
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Alternative Price"
                            name="altPrice"
                        >
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/LKR\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Currency and Status */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Currency"
                            name="currency"
                            rules={[{ required: true, message: 'Please select currency' }]}
                        >
                            <Select placeholder="Select currency" size="large">
                                <Option value="LKR">LKR - Sri Lankan Rupee</Option>
                                <Option value="USD">USD - US Dollar</Option>
                                <Option value="EUR">EUR - Euro</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status" size="large">
                                <Option value="Active">Active</Option>
                                <Option value="Inactive">Inactive</Option>
                                <Option value="Discontinued">Discontinued</Option>
                            </Select>
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
                        Update Item
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateItemModal;