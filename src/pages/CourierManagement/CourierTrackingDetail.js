import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
  Button,
  Label,
  Input,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { Tag, Timeline, Space, Image, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import * as courierService from "../../service/courierService";

const CourierTrackingDetail = () => {
  document.title = "Courier Tracking | Address";

  const history = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [trackingData, setTrackingData] = useState(null);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { state } = location;
    if (state && state.trackingData) {
      setTrackingData(state.trackingData);
      setSearchTrackingNumber(state.trackingData.trackingNumber || "");
    }
  }, [location]);

  const handleTrackOrder = async (trackingNumber) => {
    if (!trackingNumber) {
      message.warning("Please enter a tracking number");
      return;
    }

    setLoading(true);
    popUploader(dispatch, true);
    try {
      const resp = await courierService.trackOrder(trackingNumber);
      if (resp?.success !== false && resp?.data) {
        setTrackingData(resp.data);
        setSearchTrackingNumber(trackingNumber);
      } else {
        message.error(resp?.message || "Failed to track order");
      }
    } catch (err) {
      console.error(err);
      handleError(err);
    } finally {
      setLoading(false);
      popUploader(dispatch, false);
    }
  };

  const handlePrintWaybill = async () => {
    if (!trackingData?.trackingNumber) {
      message.warning("Tracking number not available");
      return;
    }

    popUploader(dispatch, true);
    try {
      await courierService.printWaybillsByTrackingNumbers(
        trackingData.trackingNumber
      );
      message.success("Waybill downloaded successfully");
    } catch (err) {
      console.error(err);
      handleError(err);
      message.error("Failed to download waybill");
    } finally {
      popUploader(dispatch, false);
    }
  };

  const getStatusColor = (statusCode) => {
    switch (statusCode) {
      case "DL":
        return "green";
      case "UD":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (statusCode) => {
    switch (statusCode) {
      case "DL":
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3 mb-3">
          <Col>
            <Button
              color="secondary"
              outline
              onClick={() => history("/courier-management")}
            >
              <ArrowLeftOutlined /> Back to Orders
            </Button>
          </Col>
        </div>

        <Card>
          <CardHeader className="card-header border-0">
            <Row className="align-items-center">
              <Col sm={12} md={6}>
                <h5 className="card-title mb-0">Track Courier Order</h5>
              </Col>
              <Col sm={12} md={6} className="text-end">
                <Space>
                  <Input
                    placeholder="Enter tracking number"
                    value={searchTrackingNumber}
                    onChange={(e) => setSearchTrackingNumber(e.target.value)}
                    onPressEnter={() => handleTrackOrder(searchTrackingNumber)}
                    style={{ width: 250 }}
                  />
                  <Button
                    color="primary"
                    onClick={() => handleTrackOrder(searchTrackingNumber)}
                    disabled={!searchTrackingNumber.trim() || loading}
                  >
                    <SearchOutlined /> Track
                  </Button>
                  {trackingData && (
                    <Button color="info" outline onClick={handlePrintWaybill}>
                      <PrinterOutlined /> Print Waybill
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </CardHeader>

          <CardBody>
            {trackingData ? (
              <>
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="bg-light">
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <Label className="fw-bold">Tracking Number:</Label>
                            <p className="mb-2">{trackingData.trackingNumber}</p>
                            <Label className="fw-bold">Reference:</Label>
                            <p className="mb-2">{trackingData.reference || "-"}</p>
                            <Label className="fw-bold">Status:</Label>
                            <p className="mb-0">
                              <Tag
                                color={
                                  trackingData.isDelivered ? "success" : "processing"
                                }
                                style={{ fontSize: "14px", padding: "4px 12px" }}
                              >
                                {trackingData.isDelivered ? "Delivered" : "In Transit"}
                              </Tag>
                            </p>
                          </Col>
                          <Col md={6}>
                            {trackingData.receiverName && (
                              <>
                                <Label className="fw-bold">Receiver Name:</Label>
                                <p className="mb-2">{trackingData.receiverName}</p>
                              </>
                            )}
                            {trackingData.receiverNic && (
                              <>
                                <Label className="fw-bold">Receiver NIC:</Label>
                                <p className="mb-2">{trackingData.receiverNic}</p>
                              </>
                            )}
                            {trackingData.podImageUrl && (
                              <>
                                <Label className="fw-bold">Proof of Delivery:</Label>
                                <div className="mt-2">
                                  <Image
                                    width={200}
                                    src={trackingData.podImageUrl}
                                    alt="Proof of Delivery"
                                  />
                                </div>
                              </>
                            )}
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <h6 className="mb-3">Tracking History</h6>
                    {trackingData.trackingHistory &&
                    trackingData.trackingHistory.length > 0 ? (
                      <Timeline
                        items={trackingData.trackingHistory
                          .slice()
                          .reverse()
                          .map((item, index) => ({
                            key: index,
                            color: getStatusColor(item.statusCode),
                            dot: getStatusIcon(item.statusCode),
                            children: (
                              <div>
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1">{item.statusType}</h6>
                                    <p className="mb-1 text-muted">
                                      {item.description || "No description"}
                                    </p>
                                    {item.location && (
                                      <Tag color="blue">{item.location}</Tag>
                                    )}
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold">
                                      {item.date || moment().format("YYYY-MM-DD")}
                                    </div>
                                    <div className="text-muted">
                                      {item.time || moment().format("HH:mm:ss")}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          }))}
                      />
                    ) : (
                      <p className="text-muted">No tracking history available</p>
                    )}
                  </Col>
                </Row>
              </>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">
                  Enter a tracking number to view order details
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default CourierTrackingDetail;

