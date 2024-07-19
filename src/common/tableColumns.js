import { Tag } from "antd";
import moment from "moment";

export const PaymentTableColumns = [
  {
    title: "Order Code",
    dataIndex: ["order", "orderCode"],
    key: "orderCode",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt) => moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "Payment Status",
    key: "status",
    dataIndex: "status",
    render: (status) => {
      let color;
      let text;

      switch (status) {
        case "SUCCESS":
          color = "green";
          text = "SUCCESS";
          break;
        case "FAILED":
          color = "red";
          text = "FAILED";
          break;
        case "REFUNDED":
          color = "blue";
          text = "REFUNDED";
          break;
        case "CANCELLED":
          color = "orange";
          text = "CANCELLED";
          break;
        default:
          color = "default";
          text = "NONE";
          break;
      }

      return (
        <Tag color={color} key={status}>
          {text}
        </Tag>
      );
    },
  },
  {
    title: "Tracking Code",
    dataIndex: ["order", "trackingCode"],
    key: "trackingCode",
    render: (trackingCode) => (trackingCode ? trackingCode : " - "),
  },
  {
    title: "Net Total",
    dataIndex: ["order", "netTotal"],
    key: "netTotal",
  },
  {
    title: "Order Status",
    key: "orderStatus",
    width: "10%",
    dataIndex: ["order", "status"],
    render: (orderStatus) => {
      let color;
      let text;

      switch (orderStatus) {
        case "PENDING":
          color = "blue";
          text = "PENDING";
          break;
        case "PROCESSING":
          color = "cyan";
          text = "PROCESSING";
          break;
        case "SHIPPED":
          color = "purple";
          text = "SHIPPED";
          break;
        case "DELIVERED":
          color = "green";
          text = "DELIVERED";
          break;
        case "CANCELLED":
          color = "red";
          text = "CANCELLED";
          break;
        case "REJECTED":
          color = "orange";
          text = "REJECTED";
          break;
        default:
          color = "default";
          text = "NONE";
          break;
      }

      return (
        <Tag color={color} key={orderStatus}>
          {text}
        </Tag>
      );
    },
  },

  {
    title: "Action",
    key: "action",
    render: (text, record) => <div>{record.action}</div>,
  },
];

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
          ? "SHIPPED"
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
