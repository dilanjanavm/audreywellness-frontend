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
import { Timeline, Tag, Space, Image } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  ShopOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import * as courierService from "../../service/courierService";
import addresssLogo from "../../assets/images/logo/Audrey logo.png";

const TrackYourOrder = () => {
  document.title = "Track Your Order | Address Shop";

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const resp = await courierService.trackOrderPublic(trackingNumber.trim());
      
      if (resp?.success === true && resp?.data) {
        setTrackingData(resp.data);
        setError(null);
      } else {
        setError(resp?.message || "Order not found. Please check your tracking number.");
        setTrackingData(null);
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to track order. Please try again."
      );
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusCode, index, total) => {
    if (statusCode === "DL") {
      return <CheckCircleOutlined style={{ fontSize: "20px" }} />;
    }
    // Show different icons based on status type
    const statusType = trackingData?.trackingHistory?.[index]?.statusType || "";
    if (statusType.toLowerCase().includes("deliver")) {
      return <HomeOutlined style={{ fontSize: "20px" }} />;
    } else if (statusType.toLowerCase().includes("out for delivery")) {
      return <TruckOutlined style={{ fontSize: "20px" }} />;
    } else if (statusType.toLowerCase().includes("receive") || statusType.toLowerCase().includes("dispatch")) {
      return <ShopOutlined style={{ fontSize: "20px" }} />;
    }
    return <ClockCircleOutlined style={{ fontSize: "20px" }} />;
  };

  const getStatusColor = (statusCode, index, total) => {
    if (statusCode === "DL") {
      return "green";
    }
    // Color based on position in timeline
    if (index === total - 1) {
      return "blue"; // Latest status
    }
    return "gray"; // Past statuses
  };

  const formatStatusType = (statusType) => {
    // Format status type for better readability
    return statusType
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (date, time) => {
    if (!date) return "N/A";
    try {
      // Try to parse the date
      const dateStr = `${date} ${time || ""}`.trim();
      if (dateStr.includes("/")) {
        // Format: 2024/3/4
        const [year, month, day] = date.split("/");
        return moment(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).format("MMM DD, YYYY");
      }
      return moment(date).format("MMM DD, YYYY");
    } catch (e) {
      return date;
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time;
  };

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content d-flex align-items-center">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-3 mb-3 text-white-50">
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
              <Col md={10} lg={8} xl={7}>
                <Card className="mt-1 card-shadow">
                  <CardBody className="p-4">
                    <div className="text-center mt-1 mb-4">
                      <h2 className="text-primary">Track Your Order</h2>
                      <p className="text-muted">
                        Enter your tracking number to see the current status of
                        your order
                      </p>
                    </div>

                    <form onSubmit={handleTrackOrder}>
                      <div className="mb-4">
                        <Label htmlFor="trackingNumber" className="form-label">
                          Tracking Number
                        </Label>
                        <div className="d-flex gap-2">
                          <Input
                            id="trackingNumber"
                            name="trackingNumber"
                            className="form-control"
                            placeholder="Enter your tracking number (e.g., D00008987)"
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => {
                              setTrackingNumber(e.target.value);
                              setError(null);
                            }}
                            disabled={loading}
                          />
                          <Button
                            color="primary"
                            type="submit"
                            disabled={loading || !trackingNumber.trim()}
                            className="px-4"
                          >
                            {loading ? (
                              <Spinner size="sm" className="me-2">
                                Loading...
                              </Spinner>
                            ) : null}
                            Track My Order
                          </Button>
                        </div>
                      </div>
                    </form>

                    {error && (
                      <Alert color="danger" className="mt-3">
                        {error}
                      </Alert>
                    )}

                    {trackingData && (
                      <div className="mt-4">
                        {/* Order Summary Card */}
                        <Card className="bg-light mb-4">
                          <CardBody>
                            <Row>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="fw-bold text-muted mb-1">
                                    Tracking Number
                                  </Label>
                                  <p className="mb-0 fs-5 fw-semibold">
                                    {trackingData.trackingNumber}
                                  </p>
                                </div>
                                {trackingData.reference && (
                                  <div className="mb-3">
                                    <Label className="fw-bold text-muted mb-1">
                                      Reference
                                    </Label>
                                    <p className="mb-0">{trackingData.reference}</p>
                                  </div>
                                )}
                              </Col>
                              <Col md={6} className="text-md-end">
                                <div className="mb-3">
                                  <Label className="fw-bold text-muted mb-1">
                                    Status
                                  </Label>
                                  <div>
                                    <Tag
                                      color={
                                        trackingData.isDelivered
                                          ? "success"
                                          : "processing"
                                      }
                                      style={{
                                        fontSize: "14px",
                                        padding: "6px 16px",
                                      }}
                                    >
                                      {trackingData.isDelivered
                                        ? "Delivered"
                                        : "In Transit"}
                                    </Tag>
                                  </div>
                                </div>
                                {trackingData.receiverName && (
                                  <div>
                                    <Label className="fw-bold text-muted mb-1">
                                      Receiver
                                    </Label>
                                    <p className="mb-0">
                                      {trackingData.receiverName}
                                    </p>
                                  </div>
                                )}
                              </Col>
                            </Row>
                            {trackingData.podImageUrl && (
                              <Row className="mt-3">
                                <Col md={12}>
                                  <Label className="fw-bold text-muted mb-2">
                                    Proof of Delivery
                                  </Label>
                                  <div>
                                    <Image
                                      width={200}
                                      src={trackingData.podImageUrl}
                                      alt="Proof of Delivery"
                                      className="rounded"
                                    />
                                  </div>
                                </Col>
                              </Row>
                            )}
                          </CardBody>
                        </Card>

                        {/* Tracking Timeline */}
                        <div className="mb-3">
                          <h5 className="mb-3">Order Status Timeline</h5>
                          {trackingData.trackingHistory &&
                          trackingData.trackingHistory.length > 0 ? (
                            <Timeline
                              items={trackingData.trackingHistory
                                .slice()
                                .reverse()
                                .map((item, index, array) => {
                                  const isLatest = index === 0;
                                  const isDelivered = item.statusCode === "DL";
                                  
                                  return {
                                    key: index,
                                    color: getStatusColor(
                                      item.statusCode,
                                      index,
                                      array.length
                                    ),
                                    dot: getStatusIcon(
                                      item.statusCode,
                                      array.length - 1 - index,
                                      array.length
                                    ),
                                    children: (
                                      <div className="ps-3">
                                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                                          <div className="flex-grow-1">
                                            <h6
                                              className={`mb-2 ${
                                                isLatest ? "fw-bold" : ""
                                              }`}
                                              style={{
                                                color:
                                                  isLatest || isDelivered
                                                    ? "#1890ff"
                                                    : "#595959",
                                              }}
                                            >
                                              {formatStatusType(item.statusType)}
                                            </h6>
                                            {item.description && (
                                              <p className="text-muted mb-2 small">
                                                {item.description}
                                              </p>
                                            )}
                                            {item.location && (
                                              <Tag color="blue" className="mb-2">
                                                <i className="ri-map-pin-line me-1"></i>
                                                {item.location}
                                              </Tag>
                                            )}
                                            {item.reason && (
                                              <div className="mt-2">
                                                <Tag color="orange">
                                                  Reason: {item.reason}
                                                </Tag>
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-end ms-3">
                                            <div
                                              className={`${
                                                isLatest ? "fw-bold" : ""
                                              }`}
                                              style={{
                                                color:
                                                  isLatest || isDelivered
                                                    ? "#1890ff"
                                                    : "#8c8c8c",
                                              }}
                                            >
                                              {formatDate(item.date, item.time)}
                                            </div>
                                            {item.time && (
                                              <div className="text-muted small">
                                                {formatTime(item.time)}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  };
                                })}
                            />
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted">
                                No tracking history available yet.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!trackingData && !loading && !error && (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <i
                            className="ri-search-line"
                            style={{ fontSize: "48px", color: "#d9d9d9" }}
                          ></i>
                        </div>
                        <p className="text-muted">
                          Enter your tracking number above to get started
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default TrackYourOrder;

