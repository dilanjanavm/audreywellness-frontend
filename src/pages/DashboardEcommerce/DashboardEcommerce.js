import React, { useState, useEffect } from "react";
import { Container } from "reactstrap";
import {
  Statistic,
  Card as AntCard,
  Table,
  Tag,
  Button,
  Space,
  Alert,
  Progress,
  Empty,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TruckOutlined,
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input as AntInput } from 'antd';
import CountUp from "react-countup";
import Chart from "react-apexcharts";
import moment from "moment";
import { useDispatch } from "react-redux";
import { popUploader, handleError } from "../../common/commonFunctions";
import * as orderService from "../../service/orderService";
import * as customerService from "../../service/customerService";
import * as itemService from "../../service/itemService";
import * as complaintService from "../../service/complaintService";
import * as taskService from "../../service/taskService";
import * as courierService from "../../service/courierService";
import * as paymentService from "../../service/paymentService";
import "./DashboardEcommerce.scss";

const DashboardEcommerce = () => {
  document.title = "Dashboard | Address Shop";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeTasks: 0,
    openComplaints: 0,
    courierOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [taskStats, setTaskStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState({
    categories: [],
    series: [],
  });

  // Tracking Widget State
  const [trackOrderNumber, setTrackOrderNumber] = useState("");
  const [trackComplaintNumber, setTrackComplaintNumber] = useState("");

  const handleTrackOrder = () => {
    if (trackOrderNumber.trim()) {
      navigate("/track-your-order", { state: { orderNumber: trackOrderNumber.trim() } });
    }
  };

  const handleTrackComplaint = () => {
    if (trackComplaintNumber.trim()) {
      // NOTE: User requested route /DDx for complaint status
      navigate("/DDx", { state: { complaintNumber: trackComplaintNumber.trim() } });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    popUploader(dispatch, true);
    try {
      await Promise.all([
        loadOrders(),
        loadCustomers(),
        loadProducts(),
        loadComplaints(),
        loadTasks(),
        loadCourierOrders(),
        loadPayments(),
      ]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      popUploader(dispatch, false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders(1);
      if (response?.success !== false && response?.data) {
        const orders = response.data.records || [];
        const totalOrders = response.data.totalRecords || 0;
        const pendingOrders = orders.filter(
          (o) => o.status === "pending" || o.status === "processing"
        ).length;

        // Calculate revenue
        const revenue = orders.reduce((sum, order) => {
          return sum + (parseFloat(order.netTotal) || 0);
        }, 0);

        // Get recent orders
        const recent = orders.slice(0, 10).map((order) => ({
          key: order.id,
          orderCode: order.orderCode,
          customer: order.billingDetail?.[0]?.email || "N/A",
          amount: parseFloat(order.netTotal || 0).toFixed(2),
          status: order.status,
          date: moment(order.billingDetail?.[0]?.createdAt).format("MMM DD, YYYY"),
        }));

        // Order status distribution
        const statusCounts = {};
        orders.forEach((order) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        setOrderStatusData(
          Object.entries(statusCounts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
          }))
        );

        setStats((prev) => ({
          ...prev,
          totalOrders,
          totalRevenue: revenue,
          pendingOrders,
        }));
        setRecentOrders(recent);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers(1, 1);
      if (response?.success !== false && response?.data) {
        const totalCustomers = response.data.totalRecords || response.data.total || 0;
        setStats((prev) => ({
          ...prev,
          totalCustomers,
        }));
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await itemService.getAllItems(1, 1);
      if (response?.success !== false && response?.data) {
        const totalProducts = response.data.totalRecords || response.data.total || 0;
        setStats((prev) => ({
          ...prev,
          totalProducts,
        }));
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadComplaints = async () => {
    try {
      const response = await complaintService.getAllComplaints({ limit: 5 });
      if (response?.success !== false && response?.data) {
        const complaints = Array.isArray(response.data)
          ? response.data
          : (response.data.complaints || response.data.data || []);

        const openComplaints = complaints.filter(
          (c) => c.status === "open" || c.status === "in_progress"
        ).length;

        const recent = complaints.slice(0, 5).map((complaint) => ({
          key: complaint.id,
          id: complaint.id,
          subject: complaint.subject || complaint.title || "No Subject",
          priority: complaint.priority || "medium",
          status: complaint.status,
          date: moment(complaint.createdAt || complaint.created_at).format("MMM DD, YYYY"),
        }));

        setStats((prev) => ({
          ...prev,
          openComplaints,
        }));
        setRecentComplaints(recent);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskService.getAllPhase(true); // includeTasks = true
      if (response?.success !== false && response?.data) {
        const phases = Array.isArray(response.data) ? response.data : [];
        let allTasks = [];

        // Extract tasks from all phases
        phases.forEach((phase) => {
          if (phase.tasks && Array.isArray(phase.tasks)) {
            allTasks = [...allTasks, ...phase.tasks];
          }
        });

        const taskStats = {
          pending: allTasks.filter((t) => t.status === "pending").length,
          inProgress: allTasks.filter((t) => t.status === "ongoing" || t.status === "in_progress").length,
          completed: allTasks.filter((t) => t.status === "completed").length,
          total: allTasks.length,
        };

        setTaskStats(taskStats);
        setStats((prev) => ({
          ...prev,
          activeTasks: taskStats.pending + taskStats.inProgress,
        }));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const loadCourierOrders = async () => {
    try {
      const response = await courierService.getAllCourierOrders();
      if (response?.success !== false && response?.data) {
        const orders = Array.isArray(response.data) ? response.data : [];
        setStats((prev) => ({
          ...prev,
          courierOrders: orders.length,
        }));
      }
    } catch (error) {
      console.error("Error loading courier orders:", error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await paymentService.getAllPayments(1);
      if (response?.success !== false && response?.data) {
        // Generate revenue chart data (last 7 days)
        const payments = response.data.records || [];
        const revenueByDay = {};

        payments.forEach((payment) => {
          const date = moment(payment.createdAt || payment.created_at).format("MMM DD");
          revenueByDay[date] = (revenueByDay[date] || 0) + (parseFloat(payment.amount) || 0);
        });

        setRevenueData({
          categories: Object.keys(revenueByDay),
          series: [{
            name: "Revenue",
            data: Object.values(revenueByDay),
          }],
        });
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      processing: "blue",
      completed: "green",
      cancelled: "red",
      delivered: "green",
      open: "red",
      in_progress: "blue",
      resolved: "green",
      closed: "default",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "default",
      medium: "orange",
      high: "red",
      critical: "magenta",
    };
    return colors[priority?.toLowerCase()] || "default";
  };

  // Chart configurations
  const orderStatusChartOptions = {
    chart: {
      type: "donut",
      height: 300,
    },
    labels: orderStatusData.map((item) => item.name),
    colors: ["#458533", "#1890ff", "#faad14", "#f5222d", "#722ed1"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
    },
  };

  const revenueChartOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: ["#458533"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: revenueData.categories || [],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toFixed(2)}`,
      },
    },
  };

  // Table columns
  const orderColumns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate("/order-detail", { state: { orderData: record.key } })}
        >
          View
        </Button>
      ),
    },
  ];

  const complaintColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.replace("_", " ").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="mb-4">
            <h4 className="mb-0">Dashboard</h4>
            <p className="text-muted">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Main Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Total Orders"
                  value={stats.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: "#458533" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
                <div className="mt-2">
                  <Tag color="success" icon={<ArrowUpOutlined />}>
                    Active
                  </Tag>
                </div>
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: "#1890ff" }}
                  formatter={(value) => (
                    <>
                      $<CountUp end={value} duration={2} decimals={2} />
                    </>
                  )}
                />
                <div className="mt-2">
                  <Tag color="processing">This Month</Tag>
                </div>
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Total Customers"
                  value={stats.totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
                <div className="mt-2">
                  <Tag color="purple">Registered</Tag>
                </div>
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Total Products"
                  value={stats.totalProducts}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: "#faad14" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
                <div className="mt-2">
                  <Tag color="warning">In Catalog</Tag>
                </div>
              </AntCard>
            </Col>
          </Row>

          {/* Secondary Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Active Tasks"
                  value={stats.activeTasks}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Open Complaints"
                  value={stats.openComplaints}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: "#f5222d" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <AntCard>
                <Statistic
                  title="Courier Orders"
                  value={stats.courierOrders}
                  prefix={<TruckOutlined />}
                  valueStyle={{ color: "#13c2c2" }}
                  formatter={(value) => <CountUp end={value} duration={2} />}
                />
              </AntCard>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} lg={12}>
              <AntCard>
                <h5 className="mb-3">Order Status Distribution</h5>
                {orderStatusData.length > 0 ? (
                  <Chart
                    options={orderStatusChartOptions}
                    series={orderStatusData.map((item) => item.value)}
                    type="donut"
                    height={300}
                  />
                ) : (
                  <Empty description="No order data available" />
                )}
              </AntCard>
            </Col>
            <Col xs={24} lg={12}>
              <AntCard>
                <h5 className="mb-3">Revenue Trend</h5>
                {revenueData.series && revenueData.series.length > 0 && revenueData.series[0]?.data?.length > 0 ? (
                  <Chart
                    options={revenueChartOptions}
                    series={revenueData.series}
                    type="area"
                    height={300}
                  />
                ) : (
                  <Empty description="No revenue data available" />
                )}
              </AntCard>
            </Col>
          </Row>

          {/* Task Overview & Quick Actions */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} lg={12}>
              <AntCard>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Task Overview</h5>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate("/task-management")}
                  >
                    View All
                  </Button>
                </div>
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="text-center">
                      <div className="fs-3 fw-bold text-primary">{taskStats.pending}</div>
                      <div className="text-muted small">Pending</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="text-center">
                      <div className="fs-3 fw-bold text-info">{taskStats.inProgress}</div>
                      <div className="text-muted small">In Progress</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="text-center">
                      <div className="fs-3 fw-bold text-success">{taskStats.completed}</div>
                      <div className="text-muted small">Completed</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="text-center">
                      <div className="fs-3 fw-bold">{taskStats.total}</div>
                      <div className="text-muted small">Total</div>
                    </div>
                  </Col>
                </Row>
                {taskStats.total > 0 && (
                  <div className="mt-3">
                    <Progress
                      percent={Math.round((taskStats.completed / taskStats.total) * 100)}
                      status="active"
                      strokeColor="#458533"
                    />
                  </div>
                )}
              </AntCard>
            </Col>
            <Col xs={24} lg={12}>
              <AntCard>
                <h5 className="mb-3">Quick Actions</h5>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/create-product")}
                  >
                    Add New Product
                  </Button>
                  <Button
                    block
                    icon={<FileTextOutlined />}
                    onClick={() => navigate("/task-management")}
                  >
                    Create Task
                  </Button>
                  <Button
                    block
                    icon={<TruckOutlined />}
                    onClick={() => navigate("/courier-management")}
                  >
                    Track Courier Order
                  </Button>
                  <Button
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate("/order-management")}
                  >
                    View All Orders
                  </Button>
                </Space>

                <Divider style={{ margin: '24px 0' }} />

                <h5 className="mb-3">Quick Track</h5>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <div>
                    <label className="text-muted mb-1 small">Track Order</label>
                    <AntInput.Search
                      placeholder="Enter Order #"
                      allowClear
                      enterButton={<Button type="primary" icon={<SearchOutlined />} />}
                      size="large"
                      value={trackOrderNumber}
                      onChange={(e) => setTrackOrderNumber(e.target.value)}
                      onSearch={handleTrackOrder}
                    />
                  </div>
                  <div>
                    <label className="text-muted mb-1 small">Track Complaint</label>
                    <AntInput.Search
                      placeholder="Enter Complaint #"
                      allowClear
                      enterButton={<Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<SearchOutlined />} />}
                      size="large"
                      value={trackComplaintNumber}
                      onChange={(e) => setTrackComplaintNumber(e.target.value)}
                      onSearch={handleTrackComplaint}
                    />
                  </div>
                </Space>
              </AntCard>
            </Col>
          </Row>

          {/* Recent Orders & Complaints */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <AntCard>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Recent Orders</h5>
                  <Button
                    type="link"
                    onClick={() => navigate("/order-management")}
                  >
                    View All
                  </Button>
                </div>
                <Table
                  columns={orderColumns}
                  dataSource={recentOrders}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "No recent orders" }}
                />
              </AntCard>
            </Col>
            <Col xs={24} lg={12}>
              <AntCard>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Recent Complaints</h5>
                  <Button
                    type="link"
                    onClick={() => navigate("/complaint-management")}
                  >
                    View All
                  </Button>
                </div>
                <Table
                  columns={complaintColumns}
                  dataSource={recentComplaints}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "No recent complaints" }}
                />
              </AntCard>
            </Col>
          </Row>

          {/* Alerts Section */}
          {(stats.openComplaints > 0 || stats.pendingOrders > 5) && (
            <Row className="mt-4">
              <Col xs={24}>
                <Alert
                  message="Attention Required"
                  description={
                    <div>
                      {stats.openComplaints > 0 && (
                        <div>
                          You have <strong>{stats.openComplaints}</strong> open complaint(s) that need attention.
                        </div>
                      )}
                      {stats.pendingOrders > 5 && (
                        <div className="mt-2">
                          You have <strong>{stats.pendingOrders}</strong> pending orders that require processing.
                        </div>
                      )}
                    </div>
                  }
                  type="warning"
                  showIcon
                  closable
                  action={
                    <Space>
                      {stats.openComplaints > 0 && (
                        <Button
                          size="small"
                          onClick={() => navigate("/complaint-management")}
                        >
                          View Complaints
                        </Button>
                      )}
                      {stats.pendingOrders > 5 && (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => navigate("/order-management")}
                        >
                          View Orders
                        </Button>
                      )}
                    </Space>
                  }
                />
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardEcommerce;
