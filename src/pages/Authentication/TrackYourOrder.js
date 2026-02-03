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
import { Empty } from 'antd';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { Link, useLocation } from "react-router-dom";
import { Tag, Space, Card as AntCard, Badge, Divider, Row as AntRow, Col as AntCol, Descriptions, Typography, Collapse, Steps, Image } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// import * as taskService from "../../service/taskService";
import citypakApiService from "../../service/citypakApiService";
import addresssLogo from "../../assets/images/logo/Audrey logo.png";
import './TrackYourOrder.scss';

const { Text, Title } = Typography;

const TrackYourOrder = () => {
  document.title = "Track Your Order | Address Shop";

  const [orderNumber, setOrderNumber] = useState("");
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();

  // Auto-track if order number is provided in navigation state
  React.useEffect(() => {
    if (location.state?.orderNumber) {
      setOrderNumber(location.state.orderNumber);
      const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        setTaskData(null);
        try {
          const resp = await citypakApiService.trackOrderPublic(location.state.orderNumber);
          if (resp?.success && resp?.data) {
            setTaskData(resp.data);
            setError(null);
          } else {
            setError(resp?.message || "Order not found. Please check your order number.");
            setTaskData(null);
          }
        } catch (err) {
          console.error("Tracking error:", err);
          setError(
            err?.message ||
            "Failed to track order. Please try again."
          );
          setTaskData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchStatus();
    }
  }, [location.state]);

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
      const resp = await citypakApiService.trackOrderPublic(orderNumber.trim());

      if (resp?.success && resp?.data) {
        setTaskData(resp.data);
        setError(null);
      } else {
        setError(resp?.message || "Order not found. Please check your order number.");
        setTaskData(null);
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError(
        err?.message ||
        "Failed to track order. Please try again."
      );
      setTaskData(null);
    } finally {
      setLoading(false);
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
                            Tracking Status
                          </h4>
                          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                            Tracking Number: <strong style={{ color: '#1890ff' }}>{taskData.trackingNumber}</strong>
                          </p>
                        </div>
                        <Badge
                          status={taskData.isDelivered ? "success" : "processing"}
                          text={
                            <span style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: taskData.isDelivered ? '#52c41a' : '#1890ff'
                            }}>
                              {taskData.isDelivered ? 'Delivered' : 'In Transit'}
                            </span>
                          }
                        />
                      </div>

                      <Divider style={{ margin: '16px 0' }} />

                      <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small" colon={false}>
                        {taskData.reference && (
                          <Descriptions.Item label={
                            <Space>
                              <FileTextOutlined />
                              <span>Reference</span>
                            </Space>
                          }>
                            <Text strong>{taskData.reference}</Text>
                          </Descriptions.Item>
                        )}
                        {taskData.receiverName && (
                          <Descriptions.Item label={
                            <Space>
                              <UserOutlined />
                              <span>Receiver Name</span>
                            </Space>
                          }>
                            <Text strong>{taskData.receiverName}</Text>
                          </Descriptions.Item>
                        )}
                        {taskData.receiverNic && (
                          <Descriptions.Item label={
                            <Space>
                              <UserOutlined />
                              <span>Receiver NIC</span>
                            </Space>
                          }>
                            <Text strong>{taskData.receiverNic}</Text>
                          </Descriptions.Item>
                        )}
                        {taskData.receiverPhone && (
                          <Descriptions.Item label={
                            <Space>
                              <PhoneOutlined />
                              <span>Receiver Phone</span>
                            </Space>
                          }>
                            <Text strong>{taskData.receiverPhone}</Text>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </AntCard>

                    {/* POD Image */}
                    {taskData.podImageUrl && (
                      <AntCard
                        className="tracking-summary-card"
                        style={{ borderRadius: '12px', border: 'none', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      >
                        <div className="mb-3">
                          <h5 style={{ fontWeight: 600, color: '#262626', fontSize: '18px', marginBottom: '16px' }}>
                            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Proof of Delivery
                          </h5>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Image
                            width={200}
                            src={taskData.podImageUrl}
                            placeholder={
                              <Image
                                preview={false}
                                src={taskData.podImageUrl}
                                width={200}
                              />
                            }
                          />
                        </div>
                      </AntCard>
                    )}

                    {/* Status Timeline */}
                    <AntCard
                      className="tracking-timeline-card"
                      style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      bodyStyle={{ padding: '0px' }}
                    >
                      <Collapse
                        defaultActiveKey={['1']}
                        ghost
                        expandIconPosition="end"
                        style={{ backgroundColor: 'white', borderRadius: '12px' }}
                      >
                        <Collapse.Panel
                          header={
                            <div className="d-flex align-items-center">
                              <ClockCircleOutlined style={{ marginRight: 10, color: '#1890ff', fontSize: '18px' }} />
                              <span style={{ fontWeight: 600, fontSize: '16px', color: '#262626' }}>Tracking History</span>
                            </div>
                          }
                          key="1"
                        >
                          <div style={{ padding: '0 24px 24px 24px' }}>
                            {taskData.trackingHistory && taskData.trackingHistory.length > 0 ? (
                              <Steps
                                direction="vertical"
                                current={0}
                                items={taskData.trackingHistory.map((entry, index) => ({
                                  title: (
                                    <div className="d-flex flex-column align-items-start mb-2">
                                      <div className="d-flex justify-content-between w-100 align-items-center">
                                        <Text strong style={{ fontSize: '15px', color: '#262626' }}>
                                          {entry.status_type || entry.status_code || 'Update'}
                                        </Text>
                                        <div className="ms-3">
                                          <Tag color="cyan" style={{ margin: 0, border: 'none', background: '#e6f7ff', color: '#096dd9' }}>
                                            {entry.date} <span style={{ marginLeft: '4px', opacity: 0.8 }}>{entry.time}</span>
                                          </Tag>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                  description: (
                                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0', marginTop: '4px' }}>
                                      {entry.location && (
                                        <div className="d-flex align-items-center mb-2" style={{ color: '#595959' }}>
                                          <EnvironmentOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                                          <span style={{ fontWeight: 500 }}>{entry.location}</span>
                                        </div>
                                      )}
                                      {entry.description && (
                                        <div style={{ fontSize: '14px', color: '#8c8c8c', lineHeight: '1.5' }}>
                                          {entry.description}
                                        </div>
                                      )}
                                    </div>
                                  ),
                                  status: 'finish',
                                  icon: (
                                    entry.status_code === 'DL' ?
                                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> :
                                      <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                  )
                                }))}
                              />
                            ) : (
                              <Empty description="No tracking history available" />
                            )}
                          </div>
                        </Collapse.Panel>
                      </Collapse>
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
