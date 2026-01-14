import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
  Label,
  Input,
  Button,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { Table, Tag, Space, Modal, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  EyeOutlined,
  PrinterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import * as courierService from "../../service/courierService";

const CourierManagement = () => {
  document.title = "Courier Management | Address";

  const history = useNavigate();
  const dispatch = useDispatch();

  const [orderList, setOrderList] = useState([]);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    popUploader(dispatch, true);
    try {
      const resp = await courierService.getAllCourierOrders();
      if (resp?.success !== false && resp?.data) {
        const temp = Array.isArray(resp.data) ? resp.data : [];
        setOrderList(temp);
      } else {
        setOrderList([]);
      }
    } catch (err) {
      console.error(err);
      handleError(err);
      setOrderList([]);
    } finally {
      setLoading(false);
      popUploader(dispatch, false);
    }
  };

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
        history("/courier-tracking-detail", {
          state: { trackingData: resp.data },
        });
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

  const handleSearchTracking = () => {
    if (searchTrackingNumber.trim()) {
      handleTrackOrder(searchTrackingNumber.trim());
    } else {
      message.warning("Please enter a tracking number");
    }
  };

  const handlePrintWaybill = async (orderId, trackingNumber) => {
    if (!orderId) {
      message.warning("Order ID is required");
      return;
    }

    popUploader(dispatch, true);
    try {
      await courierService.printWaybillsByOrderId(orderId);
      message.success("Waybill downloaded successfully");
    } catch (err) {
      console.error(err);
      handleError(err);
      message.error("Failed to download waybill");
    } finally {
      popUploader(dispatch, false);
    }
  };

  const handlePrintMultipleWaybills = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one order");
      return;
    }

    const trackingNumbers = selectedRowKeys;
    popUploader(dispatch, true);
    try {
      await courierService.printWaybillsByTrackingNumbers(trackingNumbers);
      message.success("Waybills downloaded successfully");
    } catch (err) {
      console.error(err);
      handleError(err);
      message.error("Failed to download waybills");
    } finally {
      popUploader(dispatch, false);
    }
  };

  const handleViewDetails = (order) => {
    if (order.trackingNumber) {
      handleTrackOrder(order.trackingNumber);
    } else {
      message.warning("Tracking number not available");
    }
  };

  const columns = [
    {
      title: "Tracking Number",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (text) => text || "-",
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
      render: (text) => text || "-",
    },
    {
      title: "From Name",
      dataIndex: "fromName",
      key: "fromName",
      render: (text) => text || "-",
    },
    {
      title: "To Name",
      dataIndex: "toName",
      key: "toName",
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "isDelivered",
      key: "isDelivered",
      render: (isDelivered) => (
        <Tag color={isDelivered ? "success" : "processing"}>
          {isDelivered ? "Delivered" : "In Transit"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) =>
        text ? moment(text).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            color="primary"
            outline
            size="sm"
            onClick={() => handleViewDetails(record)}
          >
            <EyeOutlined /> View
          </Button>
          {record.citypakOrderId && (
            <Button
              color="info"
              outline
              size="sm"
              onClick={() =>
                handlePrintWaybill(record.citypakOrderId, record.trackingNumber)
              }
            >
              <PrinterOutlined /> Print
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: !record.trackingNumber,
      name: record.trackingNumber,
    }),
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <Col>
            <h4>Courier Management</h4>
          </Col>
        </div>

        <Card id="courierList">
          <CardHeader className="card-header border-0">
            <Row className="align-items-center gy-3">
              <Col sm={12} md={6}>
                <h5 className="card-title mb-0">Courier Orders</h5>
              </Col>
              <Col sm={12} md={6} className="text-end">
                <Button
                  color="primary"
                  className="me-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <PlusOutlined /> Create Order
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Button
                    color="info"
                    onClick={handlePrintMultipleWaybills}
                  >
                    <PrinterOutlined /> Print Selected ({selectedRowKeys.length})
                  </Button>
                )}
              </Col>
            </Row>
          </CardHeader>

          <CardBody className="pt-0">
            <Row className="mb-3">
              <Col sm={12} md={6} lg={4}>
                <Label>Search by Tracking Number</Label>
                <Input
                  placeholder="Enter tracking number (e.g., D00008987)"
                  value={searchTrackingNumber}
                  onChange={(e) => setSearchTrackingNumber(e.target.value)}
                  onPressEnter={handleSearchTracking}
                  className="mb-2"
                />
                <Button
                  color="primary"
                  outline
                  onClick={handleSearchTracking}
                  disabled={!searchTrackingNumber.trim()}
                >
                  <SearchOutlined /> Track Order
                </Button>
              </Col>
            </Row>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={orderList}
              rowKey="id"
              loading={loading}
              scroll={{ x: "fit-content" }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} orders`,
              }}
            />
          </CardBody>
        </Card>

        <Modal
          title="Create Courier Order"
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          footer={null}
          width={800}
        >
          <CreateCourierOrderModal
            onSuccess={() => {
              setIsCreateModalOpen(false);
              loadAllOrders();
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </Container>
    </div>
  );
};

// Create Order Modal Component
const CreateCourierOrderModal = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    reference: "",
    fromName: "",
    fromAddressLine1: "",
    fromAddressLine2: "",
    fromAddressLine3: "",
    fromAddressLine4: "",
    fromContactName: "",
    fromContact1: "",
    fromContact2: "",
    toName: "",
    toAddressLine1: "",
    toAddressLine2: "",
    toAddressLine3: "",
    toAddressLine4: "",
    toContactName: "",
    toContact1: "",
    toContact2: "",
    toNic: "",
    description: "",
    weightG: "",
    cashOnDeliveryAmount: "",
    numberOfPieces: "1",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    popUploader(dispatch, true);

    try {
      // Prepare data - convert empty strings to empty strings (API expects them)
      const submitData = {
        ...formData,
        weightG: parseInt(formData.weightG) || 0,
        cashOnDeliveryAmount: parseFloat(formData.cashOnDeliveryAmount) || 0,
        numberOfPieces: parseInt(formData.numberOfPieces) || 1,
      };

      const resp = await courierService.createCourierOrder(submitData);
      if (resp?.success !== false) {
        customToastMsg("Order created successfully", 1);
        onSuccess();
      } else {
        handleError(resp);
      }
    } catch (err) {
      console.error(err);
      handleError(err);
    } finally {
      setLoading(false);
      popUploader(dispatch, false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Row>
        <Col md={12}>
          <h6 className="mb-3">Reference Information</h6>
        </Col>
        <Col md={6} className="mb-3">
          <Label>Reference *</Label>
          <Input
            required
            value={formData.reference}
            onChange={(e) => handleChange("reference", e.target.value)}
            placeholder="REF-001"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Package contents"
          />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h6 className="mb-3 mt-3">Sender Information</h6>
        </Col>
        <Col md={6} className="mb-3">
          <Label>From Name *</Label>
          <Input
            required
            value={formData.fromName}
            onChange={(e) => handleChange("fromName", e.target.value)}
            placeholder="Sender Name"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact Name *</Label>
          <Input
            required
            value={formData.fromContactName}
            onChange={(e) => handleChange("fromContactName", e.target.value)}
            placeholder="John Doe"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 1 *</Label>
          <Input
            required
            value={formData.fromAddressLine1}
            onChange={(e) => handleChange("fromAddressLine1", e.target.value)}
            placeholder="123 Main Street"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 2</Label>
          <Input
            value={formData.fromAddressLine2}
            onChange={(e) => handleChange("fromAddressLine2", e.target.value)}
            placeholder="Suite 100"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 3</Label>
          <Input
            value={formData.fromAddressLine3}
            onChange={(e) => handleChange("fromAddressLine3", e.target.value)}
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 4 (City) *</Label>
          <Input
            required
            value={formData.fromAddressLine4}
            onChange={(e) => handleChange("fromAddressLine4", e.target.value)}
            placeholder="Colombo"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact 1 *</Label>
          <Input
            required
            value={formData.fromContact1}
            onChange={(e) => handleChange("fromContact1", e.target.value)}
            placeholder="0771234567"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact 2</Label>
          <Input
            value={formData.fromContact2}
            onChange={(e) => handleChange("fromContact2", e.target.value)}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h6 className="mb-3 mt-3">Receiver Information</h6>
        </Col>
        <Col md={6} className="mb-3">
          <Label>To Name *</Label>
          <Input
            required
            value={formData.toName}
            onChange={(e) => handleChange("toName", e.target.value)}
            placeholder="Receiver Name"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact Name *</Label>
          <Input
            required
            value={formData.toContactName}
            onChange={(e) => handleChange("toContactName", e.target.value)}
            placeholder="Jane Doe"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 1 *</Label>
          <Input
            required
            value={formData.toAddressLine1}
            onChange={(e) => handleChange("toAddressLine1", e.target.value)}
            placeholder="456 Oak Avenue"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 2</Label>
          <Input
            value={formData.toAddressLine2}
            onChange={(e) => handleChange("toAddressLine2", e.target.value)}
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 3</Label>
          <Input
            value={formData.toAddressLine3}
            onChange={(e) => handleChange("toAddressLine3", e.target.value)}
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Address Line 4 (City) *</Label>
          <Input
            required
            value={formData.toAddressLine4}
            onChange={(e) => handleChange("toAddressLine4", e.target.value)}
            placeholder="Kandy"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact 1 *</Label>
          <Input
            required
            value={formData.toContact1}
            onChange={(e) => handleChange("toContact1", e.target.value)}
            placeholder="0779876543"
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>Contact 2</Label>
          <Input
            value={formData.toContact2}
            onChange={(e) => handleChange("toContact2", e.target.value)}
          />
        </Col>
        <Col md={6} className="mb-3">
          <Label>NIC</Label>
          <Input
            value={formData.toNic}
            onChange={(e) => handleChange("toNic", e.target.value)}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h6 className="mb-3 mt-3">Package Information</h6>
        </Col>
        <Col md={4} className="mb-3">
          <Label>Weight (grams) *</Label>
          <Input
            type="number"
            required
            value={formData.weightG}
            onChange={(e) => handleChange("weightG", e.target.value)}
            placeholder="500"
            min="1"
          />
        </Col>
        <Col md={4} className="mb-3">
          <Label>Cash on Delivery Amount</Label>
          <Input
            type="number"
            value={formData.cashOnDeliveryAmount}
            onChange={(e) => handleChange("cashOnDeliveryAmount", e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </Col>
        <Col md={4} className="mb-3">
          <Label>Number of Pieces *</Label>
          <Input
            type="number"
            required
            value={formData.numberOfPieces}
            onChange={(e) => handleChange("numberOfPieces", e.target.value)}
            placeholder="1"
            min="1"
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="text-end">
          <Button color="secondary" onClick={onCancel} className="me-2">
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </Col>
      </Row>
    </form>
  );
};

export default CourierManagement;

