import React, {useState, useEffect} from 'react';
import {Modal, Form, Input, DatePicker, Button, Row, Col, Tag, Alert, Spin, message} from 'antd';
import Select from 'antd/lib/select';

const {Option} = Select;
import {User, Mail, Phone, AlertTriangle, Calendar, Plus} from 'react-feather';
import debounce from 'lodash/debounce';

import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import * as userService from "../../../../service/userService";
import * as customerService from "../../../../service/customerService";
import {COMPLAINT_CATEGORIES, PRIORITY_LEVELS} from "../../../../common/enum";
import {handleError, popUploader} from "../../../../common/commonFunctions";
import {useDispatch} from "react-redux";

const CreateComplaintModal = ({visible, onClose, onCreate, loading = false}) => {
    const [form] = Form.useForm();
    const [customerOptions, setCustomerOptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetailsVisible, setCustomerDetailsVisible] = useState(false);
    const [customerSearchValue, setCustomerSearchValue] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [creatingCustomer, setCreatingCustomer] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                priority: 'medium'
            });
            // Reset states
            setSelectedCustomer(null);
            setCustomerDetailsVisible(false);
            setIsNewCustomer(false);
            setCustomerSearchValue('');
            setCustomerOptions([]);
        }
    }, [visible]);


    // Debounced customer search function
    const searchCustomers = debounce(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setCustomerOptions([]);
            return;
        }

        setCustomerSearchLoading(true);
        try {
            const filters = {
                search: searchQuery.trim()
            };

            const response = await customerService.getAllCustomers(1, 100, filters);
            const customerData = response.data?.data || [];
            // Create options for Select component
            const options = customerData.map((customer) => ({
                value: customer.id,
                label: `${customer.name} - ${customer.shortName} (${customer.email || 'No email'})`,
                customer: customer // Store the full customer object in the option
            }));

            setCustomerOptions(options);
        } catch (error) {
            console.error('Error searching customers:', error);
            setCustomerOptions([]);
            message.error('Failed to search customers');
        } finally {
            setCustomerSearchLoading(false);
        }
    }, 500); // 500ms debounce



    // Handle customer search input
    const handleCustomerSearch = (value) => {
        setCustomerSearchValue(value);
        if (!value || value.trim().length < 2) {
            setCustomerOptions([]);
            setIsNewCustomer(false);
            return;
        }
        searchCustomers(value);
    };

    const handleCustomerSelect = (value, option) => {
        // Get the full customer object from the option
        const customer = option?.customer;
        if (customer) {
            setSelectedCustomer(customer);
            setCustomerDetailsVisible(true);
            setIsNewCustomer(false);
            setCustomerSearchValue('');

            // Set customer ID in form (hidden field for existing customer)
            form.setFieldsValue({
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.smsPhone || customer.phone,
                customerEmail: customer.email
            });
        }
    };

    const handleCustomerDeselect = () => {
        setSelectedCustomer(null);
        setCustomerDetailsVisible(false);
        setIsNewCustomer(false);
        setCustomerOptions([]);
        setCustomerSearchValue('');

        // Clear customer details fields
        form.setFieldsValue({
            customerId: undefined,
            customerName: undefined,
            customerPhone: undefined,
            customerEmail: undefined
        });
    };

    // Handle "Add New Customer" button
    const handleAddNewCustomer = () => {
        setIsNewCustomer(true);
        setSelectedCustomer(null);
        setCustomerDetailsVisible(false);
        setCustomerOptions([]);
        
        // Clear customer ID but keep search value for pre-filling
        form.setFieldsValue({
            customerId: undefined,
            customerName: customerSearchValue || undefined,
            customerPhone: undefined,
            customerEmail: undefined
        });
    };

    const handleSubmit = async (values) => {
        try {
            let customerId = values.customerId;
            
            // If it's a new customer, create the customer first
            if (isNewCustomer || !customerId) {
                setCreatingCustomer(true);
                
                // Create minimal customer data for complaint
                // Generate a short name from the customer name
                const shortName = values.customerName?.substring(0, 10).toUpperCase() || 'CUST';
                const customerData = {
                    name: values.customerName,
                    shortName: shortName,
                    smsPhone: values.customerPhone,
                    email: values.customerEmail || '',
                    branchName: 'Main', // Default branch
                    cityArea: 'Colombo', // Default city
                    currency: 'LKR',
                    salesType: 'Retail',
                    paymentTerms: 'COD-IML',
                    status: 'Active',
                    customerType: 'INDIVIDUAL',
                    salesGroup: 'General'
                };

                const customerResponse = await customerService.createCustomer(customerData);
                customerId = customerResponse.data?.data?.id || customerResponse.data?.id;
                
                if (!customerId) {
                    message.error('Failed to create customer. Please try again.');
                    setCreatingCustomer(false);
                    return;
                }
                
                message.success('Customer created successfully');
                setCreatingCustomer(false);
            }

            // Create complaint with customer ID
            const complaintData = {
                customerId: customerId,
                customerEmail: values.customerEmail || selectedCustomer?.email,
                customerName: values.customerName || selectedCustomer?.name,
                customerPhone: values.customerPhone || selectedCustomer?.smsPhone || selectedCustomer?.phone,
                headline: values.headline,
                description: values.description,
                category: values.category,
                priority: values.priority,
                assignedToId: values.assignedToId,
                targetResolutionDate: values.targetResolutionDate?.toISOString(),
            };

            onCreate(complaintData);
        } catch (error) {
            setCreatingCustomer(false);
            console.error('Error creating customer:', error);
            handleError(error);
            message.error('Failed to create customer. Please try again.');
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedCustomer(null);
        setCustomerDetailsVisible(false);
        setCustomerOptions([]);
        setIsNewCustomer(false);
        setCustomerSearchValue('');
        onClose();
    };

    // Hidden field to store customer ID
    useEffect(() => {
        if (!visible) {
            return;
        }
        form.setFieldsValue({ customerId: undefined });
    }, [visible, form]);
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
                {/* Hidden field for customer ID */}
                <Form.Item name="customerId" hidden>
                    <Input />
                </Form.Item>

                {/* Customer Search Section */}
                <div className="mb-4 p-3 border rounded">
                    <h5 className="mb-3">
                        <User size={16} className="me-2"/>
                        Customer Information
                    </h5>

                    {!isNewCustomer && (
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Search Customer"
                                    rules={[
                                        {required: !isNewCustomer, message: 'Please search and select customer or add new customer'},
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Type customer name, short name, or email to search..."
                                        size="large"
                                        filterOption={false}
                                        onSearch={handleCustomerSearch}
                                        onChange={handleCustomerSelect}
                                        onClear={handleCustomerDeselect}
                                        allowClear
                                        loading={customerSearchLoading}
                                        value={selectedCustomer?.id ? selectedCustomer.id : undefined}
                                        notFoundContent={
                                            customerSearchLoading ? (
                                                <div className="text-center p-2">
                                                    <Spin size="small"/> Searching...
                                                </div>
                                            ) : customerSearchValue && customerSearchValue.length >= 2 ? (
                                                <div className="text-center p-2">
                                                    <div className="mb-2">No customer found</div>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<Plus size={14} />}
                                                        onClick={handleAddNewCustomer}
                                                    >
                                                        Add as New Customer
                                                    </Button>
                                                </div>
                                            ) : (
                                                "Type at least 2 characters to search customers"
                                            )
                                        }
                                        options={customerOptions}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    {isNewCustomer && (
                        <Alert
                            message="Adding New Customer"
                            description={
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span>Fill in the customer details below. The customer will be created when you submit the complaint.</span>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setIsNewCustomer(false);
                                            setCustomerSearchValue('');
                                            form.setFieldsValue({
                                                customerId: undefined,
                                                customerName: undefined,
                                                customerPhone: undefined,
                                                customerEmail: undefined
                                            });
                                        }}
                                    >
                                        Back to Search
                                    </Button>
                                </div>
                            }
                            type="info"
                            showIcon
                            className="mb-3"
                        />
                    )}

                    {/* Customer Details */}
                    {customerDetailsVisible && selectedCustomer && (
                        <Alert
                            message="Customer Found"
                            description={
                                <div className="mt-2">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <strong>Name:</strong> {selectedCustomer.name}
                                        </Col>
                                        <Col span={8}>
                                            <strong>Phone:</strong> {selectedCustomer.smsPhone || selectedCustomer.phone || 'N/A'}
                                        </Col>
                                        <Col span={8}>
                                            <strong>Short Name:</strong> <Tag
                                            color="blue">{selectedCustomer.shortName}</Tag>
                                        </Col>
                                    </Row>
                                    <Row gutter={16} className="mt-2">
                                        <Col span={24}>
                                            <strong>Email:</strong> {selectedCustomer.email || 'N/A'}
                                        </Col>
                                    </Row>
                                    {selectedCustomer.branchName && (
                                        <Row gutter={16} className="mt-2">
                                            <Col span={24}>
                                                <strong>Branch:</strong> {selectedCustomer.branchName}
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            }
                            type="success"
                            showIcon
                            className="mb-3"
                        />
                    )}

                    {/* Customer Creation Fields (shown when adding new customer) */}
                    {isNewCustomer && (
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
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Customer Email (Optional)"
                                        name="customerEmail"
                                        rules={[{type: 'email', message: 'Please enter a valid email'}]}
                                    >
                                        <Input
                                            prefix={<Mail size={16}/>}
                                            placeholder="Enter customer email (optional)"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>

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
                        loading={loading || creatingCustomer}
                        className="px-4"
                    >
                        {creatingCustomer ? 'Creating Customer...' : isNewCustomer ? 'Create Customer & Complaint' : 'Create Complaint'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateComplaintModal;