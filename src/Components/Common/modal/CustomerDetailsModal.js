import React from "react";
import { Modal, Row, Col, Tag, Divider, Descriptions } from "antd";
import { User, Mail, Phone, MapPin, Calendar, Users, DollarSign } from "react-feather";

const CustomerDetailsModal = ({ visible, customer, onClose }) => {
    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <User size={20} className="me-2" />
                    Customer Details
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            className="customer-details-modal"
        >
            {customer && (
                <div className="p-3">
                    {/* Header Section */}
                    <div className="text-center mb-4">
                        <h4 className="mt-3 mb-1">{customer.name}</h4>
                        <Tag color="blue" className="mb-2">
                            {customer.sNo}
                        </Tag>
                        <div>
                            <Tag color={customer.status === "ACTIVE" ? "green" : "red"}>
                                {customer.status}
                            </Tag>
                            <Tag color="purple" className="ms-1">
                                {customer.customerType}
                            </Tag>
                        </div>
                    </div>

                    <Divider />

                    {/* Customer Information */}
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Short Name">
                            {customer.shortName}
                        </Descriptions.Item>

                        <Descriptions.Item label="Branch Name">
                            {customer.branchName}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                                    <Mail size={14} className="me-2" />
                                    Email
                                </span>
                            }
                        >
                            {customer.email || 'N/A'}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                                    <Phone size={14} className="me-2" />
                                    SMS Phone
                                </span>
                            }
                        >
                            {customer.smsPhone}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                                    <MapPin size={14} className="me-2" />
                                    City/Area
                                </span>
                            }
                        >
                            {customer.cityArea}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                                    <DollarSign size={14} className="me-2" />
                                    Currency
                                </span>
                            }
                        >
                            {customer.currency}
                        </Descriptions.Item>

                        <Descriptions.Item label="Sales Type">
                            {customer.salesType}
                        </Descriptions.Item>

                        <Descriptions.Item label="Payment Terms">
                            {customer.paymentTerms}
                        </Descriptions.Item>

                        <Descriptions.Item label="Sales Group">
                            {customer.salesGroup}
                        </Descriptions.Item>

                        {customer.dob && (
                            <Descriptions.Item
                                label={
                                    <span className="d-flex align-items-center">
                                        <Calendar size={14} className="me-2" />
                                        Date of Birth
                                    </span>
                                }
                            >
                                {new Date(customer.dob).toLocaleDateString()}
                            </Descriptions.Item>
                        )}

                        {customer.address && (
                            <Descriptions.Item
                                label={
                                    <span className="d-flex align-items-center">
                                        <MapPin size={14} className="me-2" />
                                        Address
                                    </span>
                                }
                            >
                                {customer.address}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
};

export default CustomerDetailsModal;