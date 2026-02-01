import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { Link } from "react-router-dom";
import { Tag, Space, Card as AntCard, Badge, Divider, Row as AntRow, Col as AntCol, Descriptions, Typography } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as taskService from "../../service/taskService";
import addresssLogo from "../../assets/images/logo/Audrey logo.png";
import './TrackYourOrder.scss';

const { Text, Title } = Typography;

const TrackYourOrder = () => {
  document.title = "Track Your Order | Address Shop";

  const [orderNumber, setOrderNumber] = useState("");
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError(null);
    setTaskData(null);

    try {
      const resp = await taskService.getTaskStatusByOrderNumber(orderNumber.trim());
      
      if (resp?.data?.data || resp?.data) {
        const data = resp.data?.data || resp.data;
        setTaskData(data);
        setError(null);
      } else {
        setError(resp?.message || "Order not found. Please check your order number.");
        setTaskData(null);
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to track order. Please try again."
      );
      setTaskData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'ongoing':
        return 'blue';
      case 'review':
        return 'orange';
      case 'pending':
        return 'default';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'In Progress';
      case 'review':
        return 'Under Review';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="track-order-page">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-3 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={addresssLogo} alt="" height="100" />
                    </Link>
                  </div>
                  <p className="mt-3 text-primary fs-15 fw-medium text-white">
                    Track Your Order
                  </p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={12} lg={10} xl={9}>
                <Card className="track-search-card">
                  <CardBody className="p-4">
                    <div className="text-center mt-1 mb-4">
                      <h2 className="text-primary mb-2">Track Your Order</h2>
                      <p className="text-muted mb-0">
                        Enter your order number to see the current status of your order
                      </p>
                    </div>

                    <form onSubmit={handleTrackOrder}>
                      <div className="mb-4">
                        <Label htmlFor="orderNumber" className="form-label fw-semibold mb-2">
                          Order Number
                        </Label>
                        <div className="d-flex gap-2">
                          <Input
                            id="orderNumber"
                            name="orderNumber"
                            className="form-control form-control-lg"
                            placeholder="Enter your order number (e.g., 232323)"
                            type="text"
                            value={orderNumber}
                            onChange={(e) => {
                              setOrderNumber(e.target.value);
                              setError(null);
                            }}
                            disabled={loading}
                            style={{ fontSize: '16px', borderRadius: '8px' }}
                          />
                          <Button
                            color="primary"
                            type="submit"
                            disabled={loading || !orderNumber.trim()}
                            className="px-4"
                            size="lg"
                            style={{ borderRadius: '8px', minWidth: '140px' }}
                          >
                            {loading ? (
                              <Spinner size="sm" className="me-2">
                                Loading...
                              </Spinner>
                            ) : null}
                            Track Order
                          </Button>
                        </div>
                      </div>
                    </form>

                    {error && (
                      <Alert color="danger" className="mt-3" style={{ borderRadius: '8px' }}>
                        <strong>Error:</strong> {error}
                      </Alert>
                    )}
                  </CardBody>
                </Card>

                {taskData && (
                  <div className="tracking-results-container" style={{ marginTop: '24px' }}>
                    {/* Order Status Card */}
                    <AntCard 
                      className="tracking-summary-card"
                      style={{ borderRadius: '12px', border: 'none', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                        <div>
                          <h4 className="mb-1" style={{ fontWeight: 600, color: '#262626', fontSize: '20px' }}>
                            Order Status
                          </h4>
                          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                            Order Number: <strong style={{ color: '#1890ff' }}>{taskData.orderNumber}</strong>
                          </p>
                        </div>
                        <Badge 
                          status={taskData.status === 'completed' ? "success" : taskData.status === 'ongoing' ? "processing" : "default"}
                          text={
                            <span style={{ 
                              fontSize: '15px', 
                              fontWeight: 600,
                              color: taskData.status === 'completed' ? '#52c41a' : taskData.status === 'ongoing' ? '#1890ff' : '#8c8c8c'
                            }}>
                              {getStatusLabel(taskData.status)}
                            </span>
                          }
                        />
                      </div>

                      <Divider style={{ margin: '16px 0' }} />

                      <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small" colon={false}>
                        <Descriptions.Item label={
                          <Space>
                            <FileTextOutlined />
                            <span>Task ID</span>
                          </Space>
                        }>
                          <Text strong>{taskData.taskId || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                          <Space>
                            <FileTextOutlined />
                            <span>Task Name</span>
                          </Space>
                        }>
                          <Text strong>{taskData.task || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                          <Space>
                            <ShoppingOutlined />
                            <span>Phase</span>
                          </Space>
                        }>
                          <Tag color="blue">{taskData.phase?.name || 'N/A'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                          <Space>
                            <CalendarOutlined />
                            <span>Due Date</span>
                          </Space>
                        }>
                          <Text>{taskData.dueDate ? dayjs(taskData.dueDate).format('MMM DD, YYYY') : 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                          <Space>
                            <CalendarOutlined />
                            <span>Created</span>
                          </Space>
                        }>
                          <Text>{taskData.createdAt ? dayjs(taskData.createdAt).format('MMM DD, YYYY') : 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                          <Space>
                            <CalendarOutlined />
                            <span>Last Updated</span>
                          </Space>
                        }>
                          <Text>{taskData.updatedAt ? dayjs(taskData.updatedAt).format('MMM DD, YYYY') : 'N/A'}</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </AntCard>

                    {/* Customer Information Card */}
                    {taskData.customerName && (
                      <AntCard 
                        className="tracking-summary-card"
                        style={{ borderRadius: '12px', border: 'none', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      >
                        <div className="mb-3">
                          <h5 style={{ fontWeight: 600, color: '#262626', fontSize: '18px', marginBottom: '16px' }}>
                            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Customer Information
                          </h5>
                        </div>

                        <Descriptions column={1} size="small" colon={false}>
                          {taskData.customerName && (
                            <Descriptions.Item label={
                              <Space>
                                <UserOutlined />
                                <span>Customer Name</span>
                              </Space>
                            }>
                              <Text strong>{taskData.customerName}</Text>
                            </Descriptions.Item>
                          )}
                          {taskData.customerMobile && (
                            <Descriptions.Item label={
                              <Space>
                                <PhoneOutlined />
                                <span>Mobile Number</span>
                              </Space>
                            }>
                              <Text strong>{taskData.customerMobile}</Text>
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </AntCard>
                    )}

                    {/* Status Timeline */}
                    <AntCard 
                      className="tracking-timeline-card"
                      style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <div className="mb-3">
                        <h5 style={{ fontWeight: 600, color: '#262626', fontSize: '18px' }}>
                          <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Order Status Timeline
                        </h5>
                      </div>

                      <div style={{ padding: '16px 0' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: taskData.status === 'completed' ? '#52c41a' : 
                                             taskData.status === 'ongoing' ? '#1890ff' : 
                                             taskData.status === 'review' ? '#faad14' : '#d9d9d9',
                              border: '2px solid #fff',
                              boxShadow: '0 0 0 2px ' + (taskData.status === 'completed' ? '#52c41a' : 
                                         taskData.status === 'ongoing' ? '#1890ff' : 
                                         taskData.status === 'review' ? '#faad14' : '#d9d9d9')
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Text strong style={{ fontSize: '16px' }}>
                                  {getStatusLabel(taskData.status)}
                                </Text>
                                <Tag color={getStatusColor(taskData.status)}>
                                  {taskData.status}
                                </Tag>
                              </div>
                              <Text type="secondary" style={{ fontSize: '13px' }}>
                                Current Status
                              </Text>
                              {taskData.phase && (
                                <div style={{ marginTop: '8px' }}>
                                  <Text type="secondary" style={{ fontSize: '13px' }}>
                                    Phase: <Text strong>{taskData.phase.name}</Text>
                                  </Text>
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {taskData.updatedAt && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {dayjs(taskData.updatedAt).format('MMM DD, YYYY')}
                                </Text>
                              )}
                            </div>
                          </div>
                        </Space>
                      </div>
                    </AntCard>
                  </div>
                )}

                {!taskData && !loading && !error && (
                  <Card className="track-search-card mt-3">
                    <CardBody>
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <ShoppingOutlined
                            style={{ fontSize: "64px", color: "#d9d9d9" }}
                          />
                        </div>
                        <p className="text-muted" style={{ fontSize: '16px' }}>
                          Enter your order number above to get started
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default TrackYourOrder;
