// src/components/item/UpdateItemModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Row, Col } from 'antd';
import { Package, DollarSign, FileText, Hash, Columns } from 'react-feather';
import * as categoryService from "../../../../service/categoryService";
import { ITEM_TYPES, MB_FLAGS, UNIT_TYPES } from "../../../../common/enum";

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
                    type: item.type,
                    isbnNo: item.isbnNo,
                    description: item.description,
                    categoryId: item.categoryId,
                    units: item.units,
                    dummy: item.dummy,
                    mbFlag: item.mbFlag,
                    price: item.price,
                    altPrice: item.altPrice,
                    salesAccount: item.salesAccount,
                    inventoryAccount: item.inventoryAccount,
                    cogsAccount: item.cogsAccount,
                    adjustmentAccount: item.adjustmentAccount,
                    wipAccount: item.wipAccount,
                    hsCode: item.hsCode,
                    longDescription: item.longDescription,
                });
            }
        }
    }, [item, visible, form]);

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await categoryService.getAllCategories();
            setCategories(response.data?.data.data || []);
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
            width={800}
            className="update-item-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Item Code and Stock ID (Read-only for update) */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Item Code"
                            name="itemCode"
                        >
                            <Input
                                prefix={<Hash size={16} />}
                                disabled
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Stock ID"
                            name="stockId"
                        >
                            <Input
                                prefix={<Columns size={16} />}
                                disabled
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Item Type"
                            name="type"
                            rules={[{ required: true, message: 'Please select item type' }]}
                        >
                            <Select placeholder="Select item type" size="large">
                                {ITEM_TYPES.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

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

                {/* Rest of the form fields remain the same */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="ISBN Number"
                            name="isbnNo"
                        >
                            <Input
                                placeholder="Enter ISBN number"
                                size="large"
                            />
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

                <Form.Item
                    label="Name"
                    name="description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <Input
                        placeholder="Enter item description"
                        size="large"
                    />
                </Form.Item>

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
                    <Col span={12}>
                        <Form.Item
                            label="MB Flag"
                            name="mbFlag"
                            rules={[{ required: true, message: 'Please select MB flag' }]}
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
                    <Col span={12}>
                        <Form.Item
                            label="Price"
                            name="price"
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <InputNumber
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                style={{ width: '100%' }}
                                size="large"
                                prefix="$"
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
                                prefix="$"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Sales Account"
                            name="salesAccount"
                            rules={[{ required: true, message: 'Please enter sales account' }]}
                        >
                            <Input
                                placeholder="Enter sales account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Inventory Account"
                            name="inventoryAccount"
                            rules={[{ required: true, message: 'Please enter inventory account' }]}
                        >
                            <Input
                                placeholder="Enter inventory account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="COGS Account"
                            name="cogsAccount"
                            rules={[{ required: true, message: 'Please enter COGS account' }]}
                        >
                            <Input
                                placeholder="Enter COGS account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Adjustment Account"
                            name="adjustmentAccount"
                            rules={[{ required: true, message: 'Please enter adjustment account' }]}
                        >
                            <Input
                                placeholder="Enter adjustment account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="WIP Account"
                            name="wipAccount"
                            rules={[{ required: true, message: 'Please enter WIP account' }]}
                        >
                            <Input
                                placeholder="Enter WIP account"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

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