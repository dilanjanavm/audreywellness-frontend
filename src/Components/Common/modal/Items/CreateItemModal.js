// src/components/item/CreateItemModal.js
import React, {useState, useEffect} from 'react';
import {Modal, Form, Input, Select, InputNumber, Button, Row, Col} from 'antd';
import {Package, FileText, Hash, Columns} from 'react-feather';
import * as categoryService from "../../../../service/categoryService";
import {UNIT_TYPES} from "../../../../common/enum";

const {Option} = Select;

const CreateItemModal = ({visible, onClose, onCreate, loading = false}) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (visible) {
            loadCategories();
            // Generate initial item code and stock ID
            generateItemCodes();
        }
    }, [visible]);

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await categoryService.getAllCategories();
            console.log(response.data?.data.data)
            setCategories(response.data?.data.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Generate item code and stock ID
    const generateItemCodes = () => {
        const timestamp = Date.now().toString().slice(-4);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        const itemCode = `ITEM${timestamp}${randomNum}`;
        const stockId = `STK${timestamp}${randomNum}`;

        form.setFieldsValue({
            itemCode: itemCode,
            stockId: stockId
        });
    };

    const handleCategoryChange = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        setSelectedCategory(category);
    };

    const handleSubmit = (values) => {
        // Prepare data with both category name and UUID
        const submitData = {
            ...values,
            category: selectedCategory?.categoryName, // Send category name
            categoryId: values.categoryId // Send UUID
        };

        onCreate(submitData);
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedCategory(null);
        onClose();
    };

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <Package size={20} className="me-2"/>
                    Create New Item
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={700}
            className="create-item-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                initialValues={{
                    currency: 'LKR',
                    status: 'Active'
                }}
            >
                {/* Item Code and Stock ID */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Item Code"
                            name="itemCode"
                            rules={[
                                {required: true, message: 'Item code is required'},
                                {min: 2, message: 'Item code must be at least 2 characters'}
                            ]}
                        >
                            <Input
                                prefix={<Hash size={16}/>}
                                placeholder="Enter item code"
                                size="large"
                                addonAfter={
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={generateItemCodes}
                                        style={{padding: 0, height: 'auto'}}
                                    >
                                        Generate
                                    </Button>
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Stock ID"
                            name="stockId"
                            rules={[
                                {required: true, message: 'Stock ID is required'},
                                {min: 2, message: 'Stock ID must be at least 2 characters'}
                            ]}
                        >
                            <Input
                                prefix={<Columns size={16}/>}
                                placeholder="Enter stock ID"
                                size="large"
                                addonAfter={
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={generateItemCodes}
                                        style={{padding: 0, height: 'auto'}}
                                    >
                                        Generate
                                    </Button>
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Description */}
                <Form.Item
                    label="Item Name/Description"
                    name="description"
                    rules={[{required: true, message: 'Please enter item description'}]}
                >
                    <Input
                        prefix={<FileText size={16}/>}
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
                            rules={[{required: true, message: 'Please select category'}]}
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
                                onChange={handleCategoryChange}
                            >
                                {categories.map(category => (
                                    <Option key={category.id} value={category.id}>
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
                            rules={[{required: true, message: 'Please select units'}]}
                        >
                            <Select placeholder="Select units" size="large">
                                {UNIT_TYPES.map(unit => (
                                    <Option key={unit} value={unit}>{unit}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Selected Category Display (Optional - for visual feedback) */}
                {selectedCategory && (
                    <div className="mb-3 p-2 border rounded bg-light">
                        <small className="text-muted">Selected Category:</small>
                        <div>
                            <strong>{selectedCategory.categoryName}</strong>
                            <small className="text-muted ms-2">({selectedCategory.id})</small>
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Unit Price"
                            name="price"
                        >
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                style={{width: '100%'}}
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
                                style={{width: '100%'}}
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
                        Create Item
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateItemModal;