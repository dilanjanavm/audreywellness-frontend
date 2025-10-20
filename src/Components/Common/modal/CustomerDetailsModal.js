import React from "react";
import { Modal, Row, Col, Tag, Divider, Descriptions } from "antd";
import { User, Mail, Phone, MapPin, Calendar, Tag as TagIcon } from "react-feather";

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
                        <div className="customer-avatar">
                            {customer.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <h4 className="mt-3 mb-1">{customer.fullName}</h4>
                        <Tag color="blue" className="mb-2">
                            {customer.customerCode}
                        </Tag>
                        <div>
                            <Tag
                                color={customer.status === 1 ? "green" : "red"}
                                icon={<TagIcon size={12} />}
                            >
                                {customer.status === 1 ? "Active" : "Inactive"}
                            </Tag>
                        </div>
                    </div>

                    <Divider />

                    {/* Customer Information */}
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                  <Mail size={14} className="me-2" />
                  Email
                </span>
                            }
                        >
                            {customer.email}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                  <Phone size={14} className="me-2" />
                  Phone
                </span>
                            }
                        >
                            {customer.phone}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span className="d-flex align-items-center">
                  <MapPin size={14} className="me-2" />
                  Address
                </span>
                            }
                        >
                            <div>
                                <div>{customer.address}</div>
                                <div>{customer.city}, {customer.country}</div>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Timeline Section */}
                    <Divider>Timeline</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="timeline-item">
                                <Calendar size={14} className="me-2 text-muted" />
                                <small className="text-muted">Created</small>
                                <div className="fw-semibold">
                                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="timeline-item">
                                <Calendar size={14} className="me-2 text-muted" />
                                <small className="text-muted">Last Updated</small>
                                <div className="fw-semibold">
                                    {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </Modal>
    );
};

export default CustomerDetailsModal;