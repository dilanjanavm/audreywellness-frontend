import {Button, Space, Tag, Typography} from "antd";
import moment from "moment";
import {EditOutlined, EyeOutlined, FileTextOutlined, PlusOutlined} from "@ant-design/icons";
import React from "react";
const {Title, Text} = Typography;

export const UserTableColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
    },
    {
        title: "Contact No",
        key: "contact_no",
        dataIndex: "contact_no",
    },
    {
        title: "Address",
        key: "address",
        dataIndex: "address",
    },
    {
        title: "Role Name",
        key: "role_name",
        dataIndex: "role_name",
    },
    {
        title: "Status",
        key: "user_status",
        width: "10%",
        dataIndex: "user_status",
        render: (user_status) => (
            <Tag
                color={
                    user_status === 1
                        ? "success"
                        : user_status === 2
                            ? "error"
                            : "default"
                }
                key={user_status}
            >
                {user_status === 1 ? "ACTIVE" : user_status === 2 ? "INACTIVE" : "none"}
            </Tag>
        ),
    },
    {
        title: "Action",
        key: "action",
        render: (text, record) => <div>{record.action}</div>,
    },
];

export const StaffTableColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "14%",
        ellipsis: true,
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: "23%",
        ellipsis: true,
    },
    {
        title: "Role ",
        dataIndex: "roleName",
        key: "roleName",
        width: "15%",
        ellipsis: true,
    },
    {
        title: "Contact No",
        dataIndex: "contactNo",
        key: "contactNo",
        width: "15%",
        ellipsis: true,
    },

    {
        title: "Status",
        key: "status",
        width: "8%",
        dataIndex: "status",
        render: (status) => (
            <Tag
                color={status === 1 ? "success" : status === 2 ? "error" : "default"}
                key={status}
                // style={{ pointerEvents: "none" }}
            >
                {status === 1 ? "Active" : status === 2 ? "Inactive" : "none"}
            </Tag>
        ),
    },
    {
        title: "Action",
        key: "action",
        render: (text, record) => <div>{record.action}</div>,
    },
];

// src/common/tableColumns.js
export const CustomerTableColumns = [
    {
        title: 'S.No',
        dataIndex: 'sNo',
        key: 'sNo',
        width: 80,
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
    },
    {
        title: 'Short Name',
        dataIndex: 'shortName',
        key: 'shortName',
        width: 150,
    },
    {
        title: 'Branch Name',
        dataIndex: 'branchName',
        key: 'branchName',
        width: 150,
    },
    {
        title: 'City/Area',
        dataIndex: 'cityArea',
        key: 'cityArea',
        width: 120,
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: 200,
    },
    {
        title: 'SMS Phone',
        dataIndex: 'smsPhone',
        key: 'smsPhone',
        width: 150,
    },
    {
        title: 'Sales Type',
        dataIndex: 'salesType',
        key: 'salesType',
        width: 120,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
            <Tag color={status.toUpperCase() === 'ACTIVE' ? 'green' : 'red'}>
                {status}
            </Tag>
        ),
    },
    {
        title: 'Actions',
        dataIndex: 'action',
        key: 'action',
        width: 200,
        fixed: 'right',
    },
];
export const RoleTableColumns = [
    {
        title: "Index",
        dataIndex: "index",
        key: "index",
        render: (text, record, index) => (
            <div style={{marginRight: "2px !important"}}>
                <span>{index + 1}</span>
            </div>
        ),
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Role Status",
        key: "role_status",
        dataIndex: "role_status",
        render: (role_status) => (
            <Tag
                color={
                    role_status === 1
                        ? "success"
                        : role_status === 2
                            ? "error"
                            : "default"
                }
                key={role_status}
            >
                {role_status === 1 ? "Active" : role_status === 2 ? "Inactive" : "none"}
            </Tag>
        ),
    },
    {
        title: "Action",
        key: "action",
        render: (text, record) => <div>{record.action}</div>,
    },
];

export const CategoryTableColumns = [
    {
        title: "Category ID",
        dataIndex: "categoryId",
        width: 20,
        key: "categoryId",
        ellipsis: true,
    },
    {
        title: "Category Name",
        dataIndex: "categoryName",
        width: 20,
        key: "categoryName",
        ellipsis: true,
    },
    {
        title: "Description",
        dataIndex: "categoryDesc",
        Width: 20,
        key: "categoryDesc",
        ellipsis: true,

    },
    {
        title: "Color",
        key: "categoryColor",
        width: "12%",
        dataIndex: "categoryColor",
        render: (color) => (
            <div className="d-flex align-items-center">
                <div
                    className="color-badge me-2"
                    style={{
                        backgroundColor: color,
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9'
                    }}
                />
                <span>{color}</span>
            </div>
        ),
    },
    {
        title: "Status",
        key: "status",
        width: "8%",
        dataIndex: "status",
        render: (status) => (
            <Tag color={status === "Active" ? "success" : "error"}>
                {status === "Active" ? "Active" : "Inactive"}
            </Tag>
        ),
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        width: 20,
        key: "createdAt",
        render: (date) => new Date(date).toLocaleDateString(),
        ellipsis: true,
    },
    {
        title: "Actions",
        key: "action",
        width: 20,
        dataIndex: "action",
        fixed: 'right'
    },
];
export const OrderListTableColumns = [
    {
        title: "Order Code",
        dataIndex: "orderCode",
        key: "orderCode",
    },

    {
        title: "Tracking Code",
        dataIndex: "trackingCode",
        key: "trackingCode",
    },

    {
        title: "Customer Email",
        dataIndex: "cusEmail",
        key: "cusEmail",
    },

    {
        title: "Contact No",
        dataIndex: "contactNo",
        key: "contactNo",
    },
    {
        title: "Order Date",
        dataIndex: "orderDate",
        key: "orderDate",
    },

    {
        title: "Total",
        dataIndex: "total",
        key: "total",
    },

    {
        title: "Status",
        key: "status",
        width: "15%",
        dataIndex: "status",
        render: (status) => (
            <Tag
                color={
                    status === "PENDING"
                        ? "warning"
                        : status === "PROCESSING"
                            ? "processing"
                            : status === "SHIPPED"
                                ? "purple"
                                : status === "DELIVERED"
                                    ? "success"
                                    : status === "CANCELLED"
                                        ? "error"
                                        : status === "REJECTED"
                                            ? "magenta"
                                            : "default"
                }
                key={status}
            >
                {status === "PENDING"
                    ? "PENDING"
                    : status === "PROCESSING"
                        ? "PROCESSING"
                        : status === "SHIPPED"
                            ? "SHIPPED"
                            : status === "DELIVERED"
                                ? "DELIVERED"
                                : status === "CANCELLED"
                                    ? "CANCELLED"
                                    : status === "REJECTED"
                                        ? "REJECTED"
                                        : "none"}
            </Tag>
        ),
    },

    {
        title: "Action",
        key: "action",

        render: (text, record) => <div>{record.action}</div>,
    },
];


export const ItemTableColumns = [
    {
        title: "Item Code",
        dataIndex: "itemCode",
        width: "10%",
        key: "itemCode",
    },
    {
        title: "Stock ID",
        dataIndex: "stockId",
        width: "10%",
        key: "stockId",
    },

    {
        title: "Name",
        dataIndex: "description",
        width: "20%",
        key: "description",
        ellipsis: true,
    },
    {
        title: "Category",
        dataIndex: "category",
        width: "12%",
        key: "category",
    },
    {
        title: "Units",
        dataIndex: "units",
        width: "8%",
        key: "units",
    },
    {
        title: "Unit Price",
        dataIndex: "price",
        width: "10%",
        key: "price",
        render: (price) => `LKR${parseFloat(price).toFixed(2)}`,
    },
    {
        title: "Status",
        key: "status",
        width: "8%",
        dataIndex: "status",
        render: (status) => (
            <Tag color={status === "Active" ? "success" : "error"}>
                {status === "Active" ? "Active" : "Inactive"}
            </Tag>
        ),
    },
    {
        title: "Actions",
        key: "action",
        width: "10%",
        dataIndex: "action",
        fixed: 'right'
    },
];

export const SupplierTableColumns = [
    {
        title: "Supplier Code",
        dataIndex: "supplierCode",
        width: "12%",
        key: "supplierCode",
    },
    {
        title: "Name",
        dataIndex: "name",
        width: "15%",
        key: "name",
    },
    {
        title: "Reference",
        dataIndex: "reference",
        width: "12%",
        key: "reference",
    },
    {
        title: "Contact Person",
        dataIndex: "contactPerson",
        width: "12%",
        key: "contactPerson",
        render: (person) => person || 'N/A',
    },
    {
        title: "Phone",
        dataIndex: "phone",
        width: "12%",
        key: "phone",
    },
    {
        title: "Email",
        dataIndex: "email",
        width: "15%",
        key: "email",
        render: (email) => email || 'N/A',
    },
    {
        title: "Items",
        dataIndex: "itemCount",
        width: "8%",
        key: "itemCount",
        render: (count, record) => (
            <Tag color="blue">
                {record.items ? record.items.length : count || 0}
            </Tag>
        ),
    },
    {
        title: "Status",
        key: "isActive",
        width: "8%",
        dataIndex: "isActive",
        render: (isActive) => (
            <Tag color={isActive ? "success" : "error"}>
                {isActive ? "Active" : "Inactive"}
            </Tag>
        ),
    },
    {
        title: "Actions",
        key: "action",
        width: "16%",
        dataIndex: "action",
        fixed: 'right'
    },
];

export const ComplaintTableColumns = [
    {
        title: "Complaint #",
        dataIndex: "complaintNumber",
        width: "12%",
        key: "complaintNumber",
    },
    {
        title: "Customer",
        dataIndex: "customer",
        width: "15%",
        key: "customer",
        render: (customer) => customer?.name || 'N/A',
    },
    {
        title: "Customer Number",
        dataIndex: "customer",
        width: "15%",
        key: "customer",
        render: (customer) => customer?.phone || 'N/A',
    },
    {
        title: "Headline",
        dataIndex: "headline",
        width: "20%",
        key: "headline",
        ellipsis: true,
    },
    {
        title: "Category",
        dataIndex: "category",
        width: "12%",
        key: "category",
        render: (category) => (
            <Tag color="blue" key={category}>
                {category?.replace('_', ' ').toUpperCase()}
            </Tag>
        ),
    },
    {
        title: "Priority",
        dataIndex: "priority",
        width: "10%",
        key: "priority",
        render: (priority) => {
            const colorMap = {
                low: 'green',
                medium: 'orange',
                high: 'red',
                critical: 'purple'
            };
            return (
                <Tag color={colorMap[priority] || 'default'} key={priority}>
                    {priority?.toUpperCase()}
                </Tag>
            );
        },
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            const colorMap = {
                open: 'blue',
                in_progress: 'orange',
                resolved: 'green',
                awaiting_feedback: 'gold',
                closed: 'gray',
                reopened: 'red'
            };
            return (
                <Tag color={colorMap[status] || 'default'}>
                    {status.replace('_', ' ').toUpperCase()}
                </Tag>
            );
        }
    },

    {
        title: "Actions",
        key: "action",
        width: "12%",
        dataIndex: "action",
        fixed: 'right'
    },
];

// Table columns for items with cost actions
export const ItemCoastTableColumns = [
    {
        title: 'Item Code',
        dataIndex: 'itemCode',
        key: 'itemCode',
        render: (text) => <strong>{text}</strong>,
        width: 120,
    },
    {
        title: 'Stock ID',
        dataIndex: 'stockId',
        key: 'stockId',
        width: 120,
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (text) => (
            <Space>
                <FileTextOutlined/>
                {text}
            </Space>
        ),
        width: 200,
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (text) => <Tag color="blue">{text}</Tag>,
        width: 120,
    },
    {
        title: 'Units',
        dataIndex: 'units',
        key: 'units',
        width: 100,
    },
    {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `LKR ${parseFloat(price || 0).toFixed(2)}`,
        width: 120,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <Tag color={status === 'Active' ? 'green' : 'red'}>
                {status}
            </Tag>
        ),
        width: 100,
    },
    {
        title: 'Cost Actions',
        key: 'action',
        fixed: 'right',
        width: 200,
        render: (text, record) => <div>{record.action}</div>,
    }
];
export const PaymentTableColumns = [
    {
        title: "Order Code",
        dataIndex: "orderCode",
        key: "orderCode",
        width: "18%",
    },
    {
        title: "Customer Email",
        dataIndex: "cusEmail",
        key: "cusEmail",
    },
    {
        title: "Payment Date",
        dataIndex: "payment_date",
        key: "payment_date",
        width: "15%",
    },
    {
        title: "Payment Status",
        key: "payment_status",
        width: "14%",
        dataIndex: "payment_status",
        render: (payment_status) => (
            <Tag
                color={
                    payment_status === "SUCCESS"
                        ? "success"
                        : payment_status === "FAILED"
                            ? "error"
                            : payment_status === "REFUNDED"
                                ? "warning"
                                : payment_status === "CANCELLED"
                                    ? "orange"
                                    : "default"
                }
                key={payment_status}
            >
                {payment_status === "SUCCESS"
                    ? "SUCCESS"
                    : payment_status === "FAILED"
                        ? "FAILED"
                        : payment_status === "REFUNDED"
                            ? "REFUNDED"
                            : payment_status === "CANCELLED"
                                ? "CANCELLED"
                                : "none"}
            </Tag>
        ),
    },

    {
        title: "Tracking Code",
        dataIndex: "trackingCode",
        key: "trackingCode",
        width: "10%",
    },

    {
        title: "Total",
        dataIndex: "total",
        key: "total",
    },
    {
        title: "Order Date",
        dataIndex: "orderDate",
        key: "orderDate",
        width: "17%",
    },
    {
        title: "Order Status",
        key: "order_status",
        width: "15%",
        dataIndex: "order_status",
        render: (order_status) => (
            <Tag
                color={
                    order_status === "PENDING"
                        ? "warning"
                        : order_status === "PROCESSING"
                            ? "processing"
                            : order_status === "SHIPPED"
                                ? "purple"
                                : order_status === "DELIVERED"
                                    ? "success"
                                    : order_status === "CANCELLED"
                                        ? "error"
                                        : order_status === "REJECTED"
                                            ? "magenta"
                                            : "default"
                }
                key={order_status}
            >
                {order_status === "PENDING"
                    ? "PENDING"
                    : order_status === "PROCESSING"
                        ? "PROCESSING"
                        : order_status === "SHIPPED"
                            ? "SHIPPED"
                            : order_status === "DELIVERED"
                                ? "DELIVERED"
                                : order_status === "CANCELLED"
                                    ? "CANCELLED"
                                    : order_status === "REJECTED"
                                        ? "REJECTED"
                                        : "none"}
            </Tag>
        ),
    },

    {
        title: "Action",
        key: "action",
        render: (text, record) => <div>{record.action}</div>,
    },
];

export const StoresTableColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        // ellipsis: true,
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        // ellipsis: true,
    },
    {
        title: "City ",
        dataIndex: "city",
        key: "city",
        // ellipsis: true,
    },
    {
        title: "Country",
        dataIndex: "country",
        key: "country",
        // ellipsis: true,
    },
    {
        title: "Postal Code",
        dataIndex: "postalCode",
        key: "postalCode",
        // ellipsis: true,
    },

    {
        title: "URL",
        key: "url",
        dataIndex: "url",
    },
    {
        title: "Action",
        key: "action",
        width: "24%",
        render: (text, record) => <div>{record.action}</div>,
    },
];
