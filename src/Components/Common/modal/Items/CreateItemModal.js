// src/components/item/CreateItemModal.js
import React, {useState, useEffect} from 'react';
import {Modal, Form, Input, Select, InputNumber, Button, Row, Col} from 'antd';
import {Package, DollarSign, FileText, Columns, Hash} from 'react-feather';
import * as categoryService from "../../../../service/categoryService";
import {ITEM_TYPES, MB_FLAGS, UNIT_TYPES} from "../../../../common/enum";

const {Option} = Select;
const {TextArea} = Input;

const CreateItemModal = ({visible, onClose, onCreate, loading = false}) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

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

    // Generate item code and stock ID (you can modify this logic as needed)
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
                    <Package size={20} className="me-2"/>
                    Create New Item
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={800}
            className="create-item-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Item Code and Stock ID - Mandatory Fields */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Item Code"
                            name="itemCode"
                            rules={[
                                {required: true, message: 'Item Code is required'},
                                {min: 2, message: 'Item Code must be at least 2 characters'}
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

                <Row gutter={16}>
                    {/* Item Type */}
                    <Col span={12}>
                        <Form.Item
                            label="Item Type"
                            name="type"
                            rules={[{required: true, message: 'Please select item type'}]}
                        >
                            <Select placeholder="Select item type" size="large">
                                {ITEM_TYPES.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Category */}
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
                                    option.children.toLowerCase().includes(input.toLowerCase())
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
                </Row>

                <Row gutter={16}>
                    {/* ISBN Number */}
                    <Col span={12}>
                        <Form.Item
                            label="ISBN Number"
                            name="isbnNo"
                        >
                            <Input
                                prefix={<Columns size={16}/>}
                                placeholder="Enter ISBN number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Units */}
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

                {/* Description */}
                <Form.Item
                    label="Name"
                    name="description"
                    rules={[{required: true, message: 'Please enter description'}]}
                >
                    <Input
                        placeholder="Enter item description"
                        size="large"
                    />
                </Form.Item>

                {/* Long Description */}
                <Form.Item
                    label="Long Description"
                    name="longDescription"
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter detailed description"
                    />
                </Form.Item>

                <Row gutter={16}>
                    {/* MB Flag */}
                    <Col span={12}>
                        <Form.Item
                            label="MB Flag"
                            name="mbFlag"
                            rules={[{required: true, message: 'Please select MB flag'}]}
                        >
                            <Select placeholder="Select MB flag" size="large">
                                {MB_FLAGS.map(flag => (
                                    <Option key={flag.value} value={flag.value}>
                                        {flag.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Dummy */}
                    <Col span={12}>
                        <Form.Item
                            label="Dummy"
                            name="dummy"
                        >
                            <Input
                                placeholder="Enter dummy value"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Price */}
                    <Col span={12}>
                        <Form.Item
                            label="Price"
                            name="price"
                            rules={[{required: true, message: 'Please enter price'}]}
                        >
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                style={{width: '100%'}}
                                size="large"
                                prefix={<DollarSign size={16}/>}
                            />
                        </Form.Item>
                    </Col>

                    {/* Alternative Price */}
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
                                prefix={<DollarSign size={16}/>}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Sales Account */}
                    <Col span={12}>
                        <Form.Item
                            label="Sales Account"
                            name="salesAccount"
                            rules={[{required: true, message: 'Please enter sales account'}]}
                        >
                            <Input
                                placeholder="Enter sales account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Inventory Account */}
                    <Col span={12}>
                        <Form.Item
                            label="Inventory Account"
                            name="inventoryAccount"
                            rules={[{required: true, message: 'Please enter inventory account'}]}
                        >
                            <Input
                                placeholder="Enter inventory account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* COGS Account */}
                    <Col span={12}>
                        <Form.Item
                            label="COGS Account"
                            name="cogsAccount"
                            rules={[{required: true, message: 'Please enter COGS account'}]}
                        >
                            <Input
                                placeholder="Enter COGS account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* Adjustment Account */}
                    <Col span={12}>
                        <Form.Item
                            label="Adjustment Account"
                            name="adjustmentAccount"
                            rules={[{required: true, message: 'Please enter adjustment account'}]}
                        >
                            <Input
                                placeholder="Enter adjustment account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* WIP Account */}
                    <Col span={12}>
                        <Form.Item
                            label="WIP Account"
                            name="wipAccount"
                            rules={[{required: true, message: 'Please enter WIP account'}]}
                        >
                            <Input
                                placeholder="Enter WIP account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    {/* HS Code */}
                    <Col span={12}>
                        <Form.Item
                            label="HS Code"
                            name="hsCode"
                        >
                            <Input
                                placeholder="Enter HS code"
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
                        Create Item
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateItemModal;