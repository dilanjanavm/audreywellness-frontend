import React, {useState, useEffect} from 'react';
import {Modal, Form, Input, DatePicker, Button, Row, Col, Tag, Alert, Spin} from 'antd';
import Select from 'antd/lib/select';

const {Option} = Select;
import {User, Mail, Phone, AlertTriangle, Calendar} from 'react-feather';
import debounce from 'lodash.debounce';

import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import * as userService from "../../../../service/userService";
import * as customerService from "../../../../service/customerService";
import {COMPLAINT_CATEGORIES, PRIORITY_LEVELS} from "../../../../common/enum";
import {handleError, popUploader} from "../../../../common/commonFunctions";
import {useDispatch} from "react-redux";


const CreateComplaintModal = ({visible, onClose, onCreate, loading = false}) => {
    const [form] = Form.useForm();
    const [customers, setCustomers] = useState([]); // Store full customer objects
    const [customerOptions, setCustomerOptions] = useState([]); // Store options for Select
    const [users, setUsers] = useState([]);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetailsVisible, setCustomerDetailsVisible] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        loadAllCustomers();
        if (visible) {
            loadUsers();
            form.setFieldsValue({
                priority: 'medium'
            });
        }
    }, [visible]);

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            setUsers(response.data?.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    // Load all customers
    const loadAllCustomers = () => {
        customerService.getAllCustomers()
            .then((res) => {
                const customerData = res.data?.data || [];

                // Store full customer objects
                setCustomers(customerData);

                // Create options for Select component
                const options = customerData.map((customer) => ({
                    value: customer.id,
                    label: `${customer.fullName} - ${customer.email}`,
                    customer: customer // Store the full customer object in the option
                }));

                setCustomerOptions(options);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    const handleCustomerSelect = (value, option) => {
        // Get the full customer object from the option
        const customer = option.customer;
        if (customer) {
            setSelectedCustomer(customer);
            setCustomerDetailsVisible(true);

            // Auto-fill customer details
            form.setFieldsValue({
                customerName: customer.fullName,
                customerPhone: customer.phone,
                customerEmail: customer.email // Also set the email field
            });
        }
    };

    const handleSubmit = (values) => {
        const complaintData = {
            customerEmail: values.customerEmail,
            customerName: values.customerName,
            customerPhone: values.customerPhone,
            headline: values.headline,
            description: values.description,
            category: values.category,
            priority: values.priority,
            assignedToId: values.assignedToId,
            targetResolutionDate: values.targetResolutionDate?.toISOString(),
        };

        onCreate(complaintData);
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedCustomer(null);
        setCustomerDetailsVisible(false);
        setCustomers([]);
        setCustomerOptions([]);
        onClose();
    };

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <AlertTriangle size={20} className="me-2"/>
                    Create New Complaint
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={900}
            className="create-complaint-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
            >
                {/* Customer Search Section */}
                <div className="mb-4 p-3 border rounded">
                    <h5 className="mb-3">
                        <User size={16} className="me-2"/>
                        Customer Information
                    </h5>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Search Customer"
                                name="customerEmail"
                                rules={[
                                    {required: true, message: 'Please select customer'},
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search customer by name or email..."
                                    size="large"
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={customerOptions}
                                    onChange={handleCustomerSelect}
                                    loading={customerSearchLoading}
                                    notFoundContent={customerSearchLoading ? <Spin size="small"/> : "No customers found"}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Customer Details */}
                    {customerDetailsVisible && selectedCustomer && (
                        <Alert
                            message="Customer Found"
                            description={
                                <div className="mt-2">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <strong>Name:</strong> {selectedCustomer.fullName}
                                        </Col>
                                        <Col span={8}>
                                            <strong>Phone:</strong> {selectedCustomer.phone}
                                        </Col>
                                        <Col span={8}>
                                            <strong>Code:</strong> <Tag color="blue">{selectedCustomer.customerCode}</Tag>
                                        </Col>
                                    </Row>
                                </div>
                            }
                            type="success"
                            showIcon
                            className="mb-3"
                        />
                    )}

                    {/* Customer Creation Fields (shown when no customer selected) */}
                    {!selectedCustomer && (
                        <>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Customer Name"
                                        name="customerName"
                                        rules={[{required: true, message: 'Please enter customer name'}]}
                                    >
                                        <Input
                                            prefix={<User size={16}/>}
                                            placeholder="Enter customer name"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Customer Phone"
                                        name="customerPhone"
                                        rules={[{required: true, message: 'Please enter customer phone'}]}
                                    >
                                        <Input
                                            prefix={<Phone size={16}/>}
                                            placeholder="Enter customer phone"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Alert
                                message="New Customer Notice"
                                description="A new customer record will be created automatically with the provided information."
                                type="info"
                                showIcon
                            />
                        </>
                    )}
                </div>

                {/* Rest of your component remains the same */}
                {/* Complaint Details */}
                <div className="mb-4">
                    <h5 className="mb-3">
                        <AlertTriangle size={16} className="me-2"/>
                        Complaint Details
                    </h5>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Headline"
                                name="headline"
                                rules={[{required: true, message: 'Please enter complaint headline'}]}
                            >
                                <Input
                                    placeholder="Brief description of the complaint"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[{required: true, message: 'Please select category'}]}
                            >
                                <Select placeholder="Select category" size="large">
                                    {COMPLAINT_CATEGORIES.map(cat => (
                                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Priority"
                                name="priority"
                            >
                                <Select placeholder="Select priority" size="large">
                                    {PRIORITY_LEVELS.map(priority => (
                                        <Option key={priority.value} value={priority.value}>
                                            <Tag color={
                                                priority.value === 'critical' ? 'red' :
                                                    priority.value === 'high' ? 'orange' :
                                                        priority.value === 'medium' ? 'blue' : 'green'
                                            }>
                                                {priority.label}
                                            </Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Assigned To"
                                name="assignedToId"
                            >
                                <Select placeholder="Assign to staff" size="large">
                                    {users.map(user => (
                                        <Option key={user.id} value={user.id}>
                                            {user.username} ({user.email})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Target Resolution Date"
                        name="targetResolutionDate"
                    >
                        <DatePicker
                            style={{width: '100%'}}
                            size="large"
                            placeholder="Select target resolution date"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{required: true, message: 'Please enter complaint description'}]}
                    >
                        <div className="ckeditor-container">
                            <CKEditor
                                editor={ClassicEditor}
                                config={{
                                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
                                    placeholder: 'Provide detailed description of the complaint...'
                                }}
                                onReady={(editor) => {
                                    console.log('CKEditor5 React Component is ready to use!', editor);
                                }}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    form.setFieldsValue({description: data});
                                }}
                            />
                        </div>
                    </Form.Item>
                </div>

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
                        Create Complaint
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateComplaintModal;