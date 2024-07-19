import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import classnames from "classnames";
import moment from "moment";
import Select from "react-select";
import { getAllPayments, searchFiltration } from "../../service/paymentService";
import { PaymentTableColumns } from "../../common/tableColumns";

import {
  Card,
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { handleError, popUploader } from "../../common/commonFunctions";

import { DatePicker, Table, Pagination } from "antd";
import debounce from "lodash/debounce";

export default function PaymentManagement() {
  document.title = "Payment | Address";
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [paymentList, setPaymentList] = useState([]);

  const [modal, setModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const toggleMarkPaymentModal = (record) => {
    setSelectedRecord(record);
    setModal(!modal);
  };

  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchTrackingID, setSearchTrackingID] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchOrderDate, setSearchOrderDate] = useState("");

  const [searchPaymentDateRange, setSearchPaymentDateRange] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");

  //-------------------------- pagination --------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadAllPayments(currentPage, "");
  }, []);

  const loadAllPayments = async (
    currentPage,
    status,
    orderCode = "",
    customerName = "",
    email = "",
    trackingId = "",
    orderDate = ""
  ) => {
    // clearFiltrationFields();
    popUploader(dispatch, true);

    try {
      const resp = await searchFiltration(
        currentPage,
        status,
        orderCode,
        customerName,
        email,
        trackingId,
        orderDate
      );

      console.log(resp.data.records);

      const temp = resp.data.records.map((record) => {
        return {
          ...record,
          action: (
            <Button
              color="primary"
              className="m-2"
              outline
              onClick={() => toggleMarkPaymentModal(record)}
            >
              View
            </Button>
          ),
        };
      });

      setPaymentList(temp);
      setCurrentPage(resp?.data?.currentPage);
      setTotalCount(resp?.data?.totalCount);
    } catch (err) {
      handleError(err);
    } finally {
      popUploader(dispatch, false);
    }
  };

  const toggleTab = (tab, status) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      debounceHandleSearchPaymentFiltration(
        1,
        status,
        searchOrderId,
        searchCustomerName,
        searchEmail,
        searchTrackingID,
        searchOrderDate
      );
    }
  };

  const debouncedLoadAllPayments = debounce(
    (
      currentPage,
      status,
      orderCode,
      customerName,
      email,
      trackingId,
      orderDate
    ) => {
      loadAllPayments(
        currentPage,
        status,
        orderCode,
        customerName,
        email,
        trackingId,
        orderDate
      );
    },
    300
  );

  const debounceHandleSearchPaymentFiltration = (
    currentPage = 1,
    status,
    orderCode,
    customerName,
    email,
    trackingId,
    orderDate
  ) => {
    debouncedLoadAllPayments(
      currentPage,
      status,
      orderCode,
      customerName,
      email,
      trackingId,
      orderDate
    );
  };

  const onChangePagination = (page) => {
    setCurrentPage(page);

    if (
      !searchOrderId &&
      !searchCustomerName &&
      !searchEmail &&
      !searchTrackingID &&
      !searchOrderDate &&
      !selectedOrderStatus &&
      !selectedPaymentStatus
    ) {
      loadAllPayments(page, selectedPaymentStatus);
    } else {
      debounceHandleSearchPaymentFiltration(
        page,
        selectedPaymentStatus,
        searchOrderId,
        searchCustomerName,
        searchEmail,
        searchTrackingID,
        searchOrderDate
      );
    }
  };

  const clearFiltrationFields = () => {
    //setActiveTab("1");
    setSelectedPaymentStatus("");
    setSearchOrderId("");
    setSearchCustomerName("");
    setSearchTrackingID("");
    setSearchEmail("");
    setSearchOrderDate("");
    setSearchPaymentDateRange("");
    setSelectedOrderStatus("");
  };

  return (
    <>
      <div className="page-content">
        <Container fluid>
          <div className="row mt-3">
            <h4>Payment Management</h4>
          </div>
          <Card id="paymentList">
            <CardHeader className="card-header border-0">
              <Row className="align-items-center gy-3">
                <div className="col-sm">
                  <h5 className="card-title mb-0">Payment History</h5>
                </div>
              </Row>
            </CardHeader>

            <CardBody className="pt-0">
              <div>
                <Nav
                  className="nav-tabs nav-tabs-custom nav-primary"
                  role="tablist"
                >
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => {
                        toggleTab("1", "");
                      }}
                      href="#"
                    >
                      <i className="ri-apps-fill me-1 align-bottom"></i>
                      All Payments
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => toggleTab("2", "SUCCESS")}
                      href="#"
                    >
                      <i className="ri-checkbox-circle-fill me-1 align-bottom"></i>
                      Success
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => toggleTab("3", "CANCELLED")}
                      href="#"
                    >
                      <i className="ri-close-circle-fill me-1 align-bottom"></i>
                      Cancelled
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "4" })}
                      onClick={() => toggleTab("4", "REFUNDED")}
                      href="#"
                    >
                      <i className="ri-refund-fill me-1 align-bottom"></i>
                      Refund
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "5" })}
                      onClick={() => toggleTab("5", "FAILED")}
                      href="#"
                    >
                      <i className="ri-error-warning-fill me-1 align-bottom"></i>
                      Fail
                    </NavLink>
                  </NavItem>
                </Nav>

                <Row className="mt-3">
                  <Col sm={12} md={6} lg={3} className="mb-3">
                    <Label>Search By Order ID</Label>
                    <Input
                      placeholder="Search order by order ID"
                      value={searchOrderId}
                      onChange={(e) => {
                        setSearchOrderId(e.target.value);
                        debounceHandleSearchPaymentFiltration(
                          1,
                          selectedPaymentStatus,
                          e.target.value,
                          searchCustomerName,
                          searchEmail,
                          searchTrackingID,
                          searchOrderDate
                        );
                      }}
                    />
                  </Col>
                  <Col sm={12} md={6} lg={3}>
                    <Label>Search By Customer Name</Label>
                    <Input
                      placeholder="Search order by customer name"
                      value={searchCustomerName}
                      onChange={(e) => {
                        setSearchCustomerName(e.target.value);
                        debounceHandleSearchPaymentFiltration(
                          1,
                          selectedPaymentStatus,
                          searchOrderId,
                          e.target.value,
                          searchEmail,
                          searchTrackingID,
                          searchOrderDate
                        );
                      }}
                    />
                  </Col>

                  <Col sm={12} md={6} lg={3}>
                    <Label>Search By Customer Email</Label>
                    <Input
                      placeholder="Search order by email"
                      value={searchEmail}
                      onChange={(e) => {
                        setSearchEmail(e.target.value);
                        debounceHandleSearchPaymentFiltration(
                          1,
                          selectedPaymentStatus,
                          searchOrderId,
                          searchCustomerName,
                          e.target.value,
                          searchTrackingID,
                          searchOrderDate
                        );
                      }}
                    />
                  </Col>

                  <Col sm={12} md={6} lg={3}>
                    <Label>Search By Tracking ID</Label>
                    <Input
                      placeholder="Search order by tracking ID"
                      value={searchTrackingID}
                      onChange={(e) => {
                        setSearchTrackingID(e.target.value);
                        debounceHandleSearchPaymentFiltration(
                          1,
                          selectedPaymentStatus,
                          searchOrderId,
                          searchCustomerName,
                          searchEmail,
                          e.target.value,
                          searchOrderDate
                        );
                      }}
                    />
                  </Col>

                  <Col sm={12} md={6} lg={3}>
                    <Label>Search By Order Date </Label>
                    <DatePicker
                      style={{ height: 40, width: "100%", borderRadius: 4 }}
                      onChange={(date) => {
                        const formattedDate = date
                          ? date.format("YYYY-MM-DD")
                          : null;
                        setSearchOrderDate(formattedDate);
                        debounceHandleSearchPaymentFiltration(
                          1,
                          selectedPaymentStatus,
                          searchOrderId,
                          searchCustomerName,
                          searchEmail,
                          searchTrackingID,
                          formattedDate
                        );
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col sm={12} lg={12}>
                    <Table
                      className="mx-3 my-4"
                      pagination={false}
                      columns={PaymentTableColumns}
                      dataSource={paymentList}
                      scroll={{ x: "fit-content" }}
                    />
                  </Col>

                  <Modal
                    isOpen={modal}
                    toggle={() => toggleMarkPaymentModal(null)}
                  >
                    <ModalHeader toggle={() => toggleMarkPaymentModal(null)}>
                      Payment Details
                    </ModalHeader>
                    <ModalBody>
                      {selectedRecord ? (
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Order Code
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.orderCode}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Tracking Code
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.trackingCode || " - "}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Net Total
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.netTotal}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Shipping Fee
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.shippingFee}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Sub Total
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.subTotal}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Discount Amount
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.discountAmount || " - "}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Order Status
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.order.status}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Payment Status
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {selectedRecord.status}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Order Created At
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {moment(selectedRecord.order.createdAt).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Payment Created At
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {moment(selectedRecord.createdAt).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <p>No record selected</p>
                      )}
                    </ModalBody>

                    <ModalFooter>
                      <Button
                        color="secondary"
                        onClick={() => toggleMarkPaymentModal(null)}
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </Modal>
                </Row>
                <Row>
                  <Col
                    className=" d-flex justify-content-end"
                    sm={12}
                    md={12}
                    lg={12}
                    xl={12}
                  >
                    <Pagination
                      className="m-3"
                      current={currentPage}
                      onChange={onChangePagination}
                      defaultPageSize={15}
                      total={totalCount}
                      showSizeChanger={false}
                      showTotal={(total) => `Total ${total} items`}
                    />
                  </Col>
                </Row>
              </div>
            </CardBody>
          </Card>
        </Container>
      </div>
    </>
  );
}
