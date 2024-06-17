import { Tag } from "antd";

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

//**Staff Table Columns
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

export const CustomerTableColumns = [
  {
    title: " Name",
    dataIndex: "name",
    width: "15%",
    key: "name",
  },
  {
    title: "Contact No",
    key: "contactNo",
    width: "15%",
    dataIndex: "contactNo",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    width: "22%",
    ellipsis: true,
  },

  {
    title: "Status",
    key: "status",
    width: "14%",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === 1 ? "success" : status === 2 ? "error" : "default"}
        key={status}
        style={{
          minWidth: "65px",
          // height: "30px",
          // lineHeight: "30px",
          textAlign: "center",
        }}
      >
        {status === 1 ? "Active" : status === 2 ? "Inactive" : "none"}
      </Tag>
    ),
  },
  // {
  //   title: "Action",
  //   key: "action",
  //   render: (text, record) => <div>{record.action}</div>,
  // },
];

export const RoleTableColumns = [
  {
    title: "Index",
    dataIndex: "index",
    key: "index",
    render: (text, record, index) => (
      <div style={{ marginRight: "2px !important" }}>
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
    title: "Image",
    dataIndex: "file",
    key: "file",

    render: (text, record) => (
      <div
        style={{
          maxWidth: 120,
          minWidth: 80,
        }}
      >
        {record.file}
      </div>
    ),
  },

  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },

  {
    title: "Hierarchy",
    dataIndex: "hierarchy",
    key: "hierarchy",
  },

  {
    title: "Status",
    key: "status",
    width: "12%",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === 1 ? "success" : status === 2 ? "error" : "default"}
        key={status}
      >
        {status === 1 ? "ACTIVE" : status === 2 ? "INACTIVE" : "none"}
      </Tag>
    ),
  },

  {
    title: "Action",
    key: "action",

    render: (text, record) => <div>{record.action}</div>,
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
    title: "Customer Name",
    dataIndex: "customerName",
    key: "customerName",
  },

  {
    title: "Contact No",
    dataIndex: "contactNo",
    key: "contactNo",
  },
  {
    title: "created date",
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
            : "default"
        }
        key={status}
      >
        {status === "PENDING"
          ? "PENDING"
          : status === "PROCESSING"
          ? "PROCESSING"
          : status === "SHIPPED"
          ? "DELIVERING"
          : status === "DELIVERED"
          ? "DELIVERED"
          : status === "CANCELLED"
          ? "CANCELLED"
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
