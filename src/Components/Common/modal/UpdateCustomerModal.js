import React, {useEffect} from 'react';
import {Modal, Form, Input, Select, Button, Row, Col, Descriptions, Tag, DatePicker} from 'antd';
import {User, Mail, Phone, MapPin, Compass, Users} from 'react-feather';

const {Option} = Select;
const {TextArea} = Input;

const UpdateCustomerModal = ({
                                 visible,
                                 customer,
                                 onClose,
                                 onUpdate,
                                 loading = false
                             }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (customer && visible) {
            form.setFieldsValue({
                sNo: customer.sNo,
                name: customer.name,
                shortName: customer.shortName,
                branchName: customer.branchName,
                cityArea: customer.cityArea,
                email: customer.email,
                smsPhone: customer.smsPhone,
                currency: customer.currency,
                salesType: customer.salesType,
                paymentTerms: customer.paymentTerms,
                dob: customer.dob ? moment(customer.dob) : null,
                address: customer.address,
                status: customer.status,
                salesGroup: customer.salesGroup,
                customerType: customer.customerType,
            });
        }
    }, [customer, visible, form]);

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
                    <User size={20} className="me-2"/>
                    Update Customer
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={800}
            className="update-customer-modal"
        >
            {customer && (
                <>
                    <Descriptions size="small" column={2} bordered className="mb-4">
                        <Descriptions.Item label="Customer ID" span={1}>
                            <Tag color="blue">{customer.id}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Created" span={1}>
                            {new Date(customer.createdAt).toLocaleDateString()}
                        </Descriptions.Item>
                    </Descriptions>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        requiredMark="optional"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="S.No"
                                    name="sNo"
                                    rules={[{required: true, message: 'Please enter S.No'}]}
                                >
                                    <Input placeholder="Enter S.No" size="large"/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{required: true, message: 'Please enter customer name'}]}
                                >
                                    <Input prefix={<User size={16}/>} placeholder="Enter full name" size="large"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Short Name"
                                    name="shortName"
                                    rules={[{required: true, message: 'Please enter short name'}]}
                                >
                                    <Input placeholder="Enter short name" size="large"/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Branch Name"
                                    name="branchName"
                                >
                                    <Input prefix={<MapPin size={16}/>} placeholder="Enter branch name" size="large"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="City/Area"
                                    name="cityArea"
                                >
                                    <Input prefix={<Compass size={16}/>} placeholder="Enter city/area" size="large"/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{type: 'email', message: 'Please enter valid email'}]}
                                >
                                    <Input prefix={<Mail size={16}/>} placeholder="customer@example.com" size="large"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="SMS Phone"
                                    name="smsPhone"
                                    rules={[{required: true, message: 'Please enter SMS phone'}]}
                                >
                                    <Input prefix={<Phone size={16}/>} placeholder="+94 77 123 4567" size="large"/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Currency"
                                    name="currency"
                                >
                                    <Select placeholder="Select currency" size="large">
                                        <Option value="LKR">LKR</Option>
                                        <Option value="USD">USD</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Sales Type"
                                    name="salesType"
                                >
                                    <Select placeholder="Select sales type" size="large">
                                        <Option value="RETAIL">Retail</Option>
                                        <Option value="WHOLESALE">Wholesale</Option>
                                        <Option value="CORPORATE">Corporate</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Terms"
                                    name="paymentTerms"
                                >
                                    <Select placeholder="Select payment terms" size="large">
                                        <Option value="COD_IML">COD IML</Option>
                                        <Option value="CREDIT">Credit</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Date of Birth"
                                    name="dob"
                                >
                                    <DatePicker style={{width: '100%'}} size="large"/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Status"
                                    name="status"
                                >
                                    <Select placeholder="Select status" size="large">
                                        <Option value="ACTIVE">Active</Option>
                                        <Option value="INACTIVE">Inactive</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Sales Group"
                                    name="salesGroup"
                                >
                                    <Input placeholder="Enter sales group" size="large"/>
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
                            <TextArea rows={3} placeholder="Enter complete address"/>
                        </Form.Item>

                        <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                            <Button size="large" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size="large" loading={loading} className="px-4">
                                Update Customer
                            </Button>
                        </div>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default UpdateCustomerModal;