import React, { useEffect, useState } from "react";
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
} from "reactstrap";
import {
  checkPermission,
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import * as constant from "../../common/constants";
import Cookies from "js-cookie";
import { OrderListTableColumns } from "../../common/tableColumns";
import classnames from "classnames";
import { Table } from "antd";
import { Pagination } from "antd";
import Select from "react-select";
import { DatePicker, Space } from "antd";
import moment from "moment"; // Import moment
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { Redirect } from "react-router-dom";
import * as orderService from "../../service/orderService";
import { getAllOrderStatus } from "../../service/orderStatusService";

const OrderManagement = () => {
  document.title = "Orders | Address";

  const history = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [orderList, setOrderList] = useState([]);
  const [searchOrderCode, setSearchOrderCode] = useState("");
  const [searchCustomerEmail, setSearchCustomerEmail] = useState("");
  const [searchCustomerContactNo, setSearchCustomerContactNo] = useState("");
  const [searchDateRange, setSearchDateRange] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [searchTrackingCode, setSearchTrackingCode] = useState("");

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  const { RangePicker } = DatePicker;

  useEffect(() => {
    loadAllOrders(currentPage);
  }, []);

  const loadAllOrders = async (currentPage) => {
    let temp = [];
    clearFiltrationFields();
    popUploader(dispatch, true);
    await orderService
      .getAllOrders(currentPage)
      .then((resp) => {
        console.log(resp);
        resp?.data?.records.map((ord, index) => {
          temp.push({
            orderCode: ord?.orderCode,
            trackingCode: ord?.trackingCode ? ord?.trackingCode : "-",
            cusEmail: ord?.billingDetail[0]?.email,
            contactNo: ord?.billingDetail[0]?.contactNo,
            orderDate: moment(ord?.billingDetail[0]?.createdAt).format(
              "YYYY-MM-DD"
            ),
            total: parseFloat(ord?.netTotal).toFixed(2),
            status: ord?.status,
            action: (
              <>
                <Button
                  onClick={() =>
                    history("/order-detail", {
                      state: { orderData: ord?.id },
                    })
                  }
                  color="primary"
                  outline
                  className="m-2"
                >
                  View
                </Button>
                {/* {checkPermission(UPDATE_ORDER) && (
                    <Button color="warning" outline className="m-2">
                      Update
                    </Button>
                  )} */}
              </>
            ),
          });
        });
        setOrderList(temp);
        setCurrentPage(resp?.data?.currentPage);
        setTotalRecodes(resp?.data?.totalRecords);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        console.log(err);
        popUploader(dispatch, false);
        handleError(err);
      })
      .finally();
  };

  const toggleTab = (tab, type) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      history("/order-management");
      setSelectedStatus(type);
      debounceHandleSearchOrderFiltration(
        searchOrderCode,
        searchCustomerEmail,
        searchCustomerContactNo,
        searchDateRange,
        searchTrackingCode,
        type,
        1
      );
    }
  };

  const handleSearchOrderFiltration = (
    orderCode,
    email,
    Contact,
    dateRange,
    trackingCode,
    Status,
    currentPage
  ) => {
    if (
      !orderCode &&
      !email &&
      !Contact &&
      (dateRange === undefined || dateRange === null || dateRange === "") &&
      trackingCode === "" &&
      (Status === undefined || Status === null || Status === "")
    ) {
      loadAllOrders(currentPage);
    } else {
      let startDate = "";
      let endDate = "";

      if (dateRange && dateRange.length === 2) {
        startDate = moment(dateRange[0]).format("YYYY-MM-DD");
        endDate = moment(dateRange[1]).format("YYYY-MM-DD");
      }

      setOrderList([]);
      let data = {
        orderCode: orderCode,
        email: email,
        contact: Contact,
        startDate: startDate,
        endDate: endDate,
        trackingCode: trackingCode,
        status: Status === undefined ? "" : Status === null ? "" : Status,
      };

      let temp = [];
      popUploader(dispatch, true);
      orderService
        .ordersFiltration(data, currentPage)
        .then((resp) => {
          console.log(resp);
          resp?.data?.records.map((ord, index) => {
            temp.push({
              orderCode: ord?.orderCode,
              trackingCode: ord?.trackingCode ? ord?.trackingCode : "-",
              cusEmail: ord?.billingDetail[0]?.email,
              contactNo: ord?.billingDetail[0]?.contactNo,
              orderDate: moment(ord?.billingDetail[0]?.createdAt).format(
                "YYYY-MM-DD"
              ),
              total: parseFloat(ord?.netTotal).toFixed(2),
              status: ord?.status,
              action: (
                <>
                  <Button
                    onClick={() =>
                      history("/order-detail", {
                        state: { orderData: ord?.id },
                      })
                    }
                    color="primary"
                    outline
                    className="m-2"
                  >
                    View
                  </Button>
                  {/* {checkPermission(UPDATE_ORDER) && (
                    <Button color="warning" outline className="m-2">
                      Update
                    </Button>
                  )} */}
                </>
              ),
            });
          });
          setOrderList(temp);
          setCurrentPage(resp?.data?.currentPage);
          setTotalRecodes(resp?.data?.totalRecords);
          popUploader(dispatch, false);
        })
        .catch((err) => {
          handleError(err);
          popUploader(dispatch, false);
        });
    }
  };

  const debounceHandleSearchOrderFiltration = React.useCallback(
    debounce(handleSearchOrderFiltration, 500),
    []
  );

  const onChangePagination = (page) => {
    console.log(page);
    setCurrentPage(page);

    if (
      !searchOrderCode &&
      !searchCustomerEmail &&
      (searchDateRange === undefined ||
        searchDateRange === null ||
        searchDateRange === "") &&
      (selectedStatus === undefined ||
        selectedStatus === null ||
        selectedStatus === "")
    ) {
      loadAllOrders(page);
    } else {
      debounceHandleSearchOrderFiltration(
        searchOrderCode,
        searchCustomerEmail,
        searchCustomerContactNo,
        searchDateRange,
        searchTrackingCode,
        selectedStatus,
        page
      );
    }
  };

  const clearFiltrationFields = () => {
    setActiveTab("1");
    setSearchOrderCode("");
    setSearchCustomerEmail("");
    setSearchDateRange("");
    setSelectedStatus("");
    setSearchTrackingCode("");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Order Management</h4>
        </div>
        <Card id="orderList">
          <CardHeader className="card-header border-0">
            <Row className="align-items-center gy-3">
              <div className="col-sm">
                <h5 className="card-title mb-0">Order History</h5>
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
                    <i className="ri-store-2-fill me-1 align-bottom"></i> All
                    Orders
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggleTab("2", "PENDING");
                    }}
                    href="#"
                  >
                    <i className="ri-restart-line me-1 align-bottom"></i>
                    Pending
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggleTab("3", "PROCESSING");
                    }}
                    href="#"
                  >
                    <i className="ri-luggage-cart-line me-1 align-bottom"></i>{" "}
                    Processing
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => {
                      toggleTab("4", "SHIPPED");
                    }}
                    href="#"
                  >
                    <i className="ri-truck-fill me-1 align-bottom"></i>
                    Shipped
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "5" })}
                    onClick={() => {
                      toggleTab("5", "DELIVERED");
                    }}
                    href="#"
                  >
                    <i className="ri-checkbox-circle-fill me-1 align-bottom"></i>{" "}
                    Delivered
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "6" })}
                    onClick={() => {
                      toggleTab("6", "CANCELLED");
                    }}
                    href="#"
                  >
                    <i className="ri-close-circle-fill me-1 align-bottom"></i>{" "}
                    Canceled
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "7" })}
                    onClick={() => {
                      toggleTab("7", "REJECTED");
                    }}
                    href="#"
                  >
                    <i className="ri-error-warning-fill me-1 align-bottom"></i>{" "}
                    Rejected
                  </NavLink>
                </NavItem>
              </Nav>

              <Row className="mt-3">
                <Col sm={12} md={6} lg={3} xl={3} xxl={2}>
                  <Label>Search By Order Code</Label>
                  <Input
                    placeholder="ORD-000000"
                    value={searchOrderCode}
                    className="mb-3"
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        e.target.value,
                        searchCustomerEmail,
                        searchCustomerContactNo,
                        searchDateRange,
                        searchTrackingCode,
                        selectedStatus,
                        1
                      );
                      setSearchOrderCode(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={3} xl={3} xxl={2}>
                  <Label>Search By Tracking Code</Label>
                  <Input
                    placeholder="Enter tracking code"
                    value={searchTrackingCode}
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        e.target.value,
                        searchCustomerEmail,
                        searchCustomerContactNo,
                        searchDateRange,
                        searchTrackingCode,
                        selectedStatus,
                        1
                      );
                      setSearchTrackingCode(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={3} xl={3} xxl={3}>
                  <Label>Search By Customer Email</Label>
                  <Input
                    placeholder="Enter customer email"
                    value={searchCustomerEmail}
                    type="email"
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        searchOrderCode,
                        e.target.value,
                        searchCustomerContactNo,
                        searchDateRange,
                        searchTrackingCode,
                        selectedStatus,
                        1
                      );
                      setSearchCustomerEmail(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={3} xl={3} xxl={2}>
                  <Label>Search By Contact No</Label>
                  <Input
                    placeholder="Enter contact no"
                    type="number"
                    value={searchCustomerContactNo}
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        searchOrderCode,
                        searchCustomerEmail,
                        e.target.value,
                        searchDateRange,
                        searchTrackingCode,
                        selectedStatus,
                        1
                      );
                      setSearchCustomerContactNo(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={12} lg={4} xl={4} xxl={3}>
                  <Label>Search By Order Date Range</Label>
                  <RangePicker
                    style={{ height: 40, width: "100%", borderRadius: 4 }}
                    onChange={(selectedDates) => {
                      if (selectedDates) {
                        const formattedDates = selectedDates.map((date) =>
                          date ? date.format("YYYY-MM-DD") : null
                        );
                        debounceHandleSearchOrderFiltration(
                          searchOrderCode,
                          searchCustomerEmail,
                          searchCustomerContactNo,
                          formattedDates,
                          searchTrackingCode,
                          selectedStatus,
                          1
                        );
                        setSearchDateRange(formattedDates);
                      } else {
                        setSearchDateRange("");
                        debounceHandleSearchOrderFiltration(
                          searchOrderCode,
                          searchCustomerEmail,
                          searchCustomerContactNo,
                          "",
                          searchTrackingCode,
                          selectedStatus,
                          1
                        );
                      }
                    }}
                  />
                </Col>
              </Row>

              <Row>
                <Col sm={12} lg={12}>
                  <Table
                    className="mx-3 my-4"
                    pagination={false}
                    columns={OrderListTableColumns}
                    dataSource={orderList}
                    scroll={{ x: "fit-content" }}
                  />
                </Col>
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
                    total={totalRecodes}
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
  );
};

export default OrderManagement;
