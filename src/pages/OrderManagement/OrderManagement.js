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

const OrderManagement = () => {
  document.title = "Orders | Address";

  const history = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("1");
  const [orderList, setOrderList] = useState([]);
  // const [orderStatus, setorderStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchCustomerContactNo, setSearchCustomerContactNo] = useState("");
  const [searchDateRange, setSearchDateRange] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState("");
  const [deliverySlotList, setDeliverySlotList] = useState([]);

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  const { RangePicker } = DatePicker;

  useEffect(() => {
    loadAllOrders(currentPage);
    // loadAllDeliverySlots();
    // loadAllOrderStatus();
  }, []);

  //   const loadAllDeliverySlots = () => {
  //     setDeliverySlotList([]);
  //     let temp = [];
  //     popUploader(dispatch, true);
  //     getAllDeliverySlotsToDropdown()
  //       .then((resp) => {
  //         console.log(resp, "166565");
  //         let temp = [];
  //         resp?.data?.records.map((time, index) => {
  //           temp.push({ value: time?.id, label: time?.name });
  //         });
  //         setDeliverySlotList(temp);
  //         popUploader(dispatch, false);
  //       })
  //       .catch((err) => {
  //         popUploader(dispatch, false);
  //         handleError(err);
  //       })
  //       .finally();
  //   };

  //   const loadAllOrderStatus = () => {
  //     setStatusList([]);
  //     let temp = [];
  //     popUploader(dispatch, true);
  //     getAllOrderStatus()
  //       .then((resp) => {
  //         let temp = [];
  //         // console.log(resp);
  //         for (let key in resp?.data) {
  //           temp.push({ value: key, label: resp?.data[key] });
  //         }
  //         setStatusList(temp);
  //         popUploader(dispatch, false);
  //       })
  //       .catch((err) => {
  //         popUploader(dispatch, false);
  //         handleError(err);
  //       })
  //       .finally();
  //   };

  const loadAllOrders = async (currentPage) => {
    let temp = [];
    // clearFiltrationFields();
    popUploader(dispatch, true);
    await orderService
      .getAllOrders(currentPage)
      .then((resp) => {
        console.log(resp);
        resp?.data?.map((ord, index) => {
          temp.push({
            orderCode: ord?.orderCode,
            trackingCode: ord?.trackingCode,
            customerName:
              ord?.billingDetail[0]?.firstName +
              " " +
              ord?.billingDetail[0]?.lastName,
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
                    // history("/order-details", { state: { orderData: ord } })
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
      //   debounceHandleSearchOrderFiltration("", "", "", "", "", type, 1);
    }
  };

  const handleChange = (e) => {
    let status = e?.label;
    console.log(status);

    // searchByOrderstatus(status === undefined ? "" : status);
    // debounceHandleSearchOrderFiltration(
    //   searchOrderId,
    //   searchCustomerName,
    //   searchCustomerContactNo,
    //   searchDateRange,
    //   selectedDeliverySlot,
    //   status === undefined ? "" : status,
    //   1
    // );
    setSelectedStatus(status);

    status === undefined
      ? toggleTab("1", "")
      : status === "Delivered"
      ? toggleTab("2", "Delivered")
      : status === "Delivering"
      ? toggleTab("3", "Delivering")
      : status === "Processing"
      ? toggleTab("4", "Processing")
      : status === "Pending"
      ? toggleTab("5", "Pending")
      : status === "Cancel"
      ? toggleTab("6", "Cancel")
      : toggleTab("1", "All");
  };

  //   const handleSearchOrderFiltration = (
  //     orderId,
  //     CusName,
  //     Contact,
  //     dateRange,
  //     deliverySlot,
  //     Status,
  //     currentPage
  //   ) => {
  //     console.log(dateRange, "00555555555555");
  //     if (
  //       !orderId &&
  //       !CusName &&
  //       !Contact &&
  //       (dateRange === undefined || dateRange === null || dateRange === "") &&
  //       deliverySlot === "" &&
  //       (Status === undefined || Status === null || Status === "")
  //     ) {
  //       loadAllOrders(currentPage);
  //     } else {
  //       let startDate = ""; // Default to empty string
  //       let endDate = ""; // Default to empty string

  //       if (dateRange && dateRange.length === 2) {
  //         // Check if dateRange is not null and has two elements
  //         startDate = moment(dateRange[0]).format("YYYY-MM-DD");
  //         endDate = moment(dateRange[1]).format("YYYY-MM-DD");
  //       }

  //       setOrderList([]);
  //       let data = {
  //         orderId: orderId,
  //         cusName: CusName,
  //         contact: Contact,
  //         startDate: startDate,
  //         endDate: endDate,
  //         deliverySlot: deliverySlot,
  //         status: Status === undefined ? "" : Status === null ? "" : Status,
  //       };

  //       let temp = [];
  //       popUploader(dispatch, true);
  //       searchOrderFiltration(data, currentPage)
  //         .then((resp) => {
  //           resp?.data?.records.map((ord, index) => {
  //             temp.push({
  //               order_id: ord?.orderId,
  //               customer:
  //                 ord?.orderCustomer?.firstName +
  //                 " " +
  //                 ord?.orderCustomer?.lastName,
  //               contactNo: ord?.orderCustomer?.contactNo,
  //               order_date: moment(ord?.createdAt).format("YYYY-MM-DD"),
  //               amount: parseFloat(ord?.total).toFixed(2),
  //               delivery_status: ord?.orderStatus,
  //               action: (
  //                 <>
  //                   <Button
  //                     onClick={() =>
  //                       history("/order-detail", {
  //                         state: { orderData: ord?.id },
  //                       })
  //                     }
  //                     color="primary"
  //                     outline
  //                     className="m-2"
  //                   >
  //                     View
  //                   </Button>
  //                   {/* {checkPermission(UPDATE_ORDER) && (
  //                     <Button color="warning" outline className="m-2">
  //                       Update
  //                     </Button>
  //                   )} */}
  //                 </>
  //               ),
  //             });
  //           });
  //           setOrderList(temp);
  //           setCurrentPage(resp?.data?.currentPage);
  //           setTotalRecodes(resp?.data?.totalRecords);
  //           popUploader(dispatch, false);
  //         })
  //         .catch((err) => {
  //           handleError(err);
  //           popUploader(dispatch, false);
  //         })
  //         .finally();
  //     }
  //   };

  //   const debounceHandleSearchOrderFiltration = React.useCallback(
  //     debounce(handleSearchOrderFiltration, 500),
  //     []
  //   );

  const onChangePagination = (page) => {
    console.log(page);
    setCurrentPage(page);

    if (
      !searchOrderId &&
      !searchCustomerName &&
      (searchDateRange === undefined ||
        searchDateRange === null ||
        searchDateRange === "") &&
      (selectedStatus === undefined ||
        selectedStatus === null ||
        selectedStatus === "")
    ) {
      //   loadAllOrders(page);
    } else {
      //   debounceHandleSearchOrderFiltration(
      //     searchOrderId,
      //     searchCustomerName,
      //     searchCustomerContactNo,
      //     searchDateRange,
      //     selectedDeliverySlot,
      //     selectedStatus,
      //     page
      //   );
    }
  };

  //   const clearFiltrationFields = () => {
  //     setActiveTab("1");
  //     setSearchOrderId("");
  //     setSearchCustomerName("");
  //     setSearchDateRange("");
  //     setSelectedStatus("");
  //     setSelectedDeliverySlot("");
  //   };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Order Management</h4>
        </div>
        <Card id="orderList">
          <Row className="d-flex mt-4 mb-1 mx-1 justify-content-end">
            {" "}
            {/* {checkPermission(MANUAL_ORDER) && (
              <Col sm={12} md={3} lg={3} xl={2}>
                <Button
                  color="primary"
                  className="w-100"
                  onClick={() => {
                    handleCreateManualOrder();
                  }}
                >
                  Create Manual Order
                </Button>
              </Col>
            )} */}
          </Row>
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
                      toggleTab("2", "Delivered");
                    }}
                    href="#"
                  >
                    <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                    Delivered
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggleTab("3", "Delivering");
                    }}
                    href="#"
                  >
                    <i className="ri-truck-line me-1 align-bottom"></i>{" "}
                    Delivering
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => {
                      toggleTab("4", "Processing");
                    }}
                    href="#"
                  >
                    <i className="ri-luggage-cart-line me-1 align-bottom"></i>{" "}
                    Processing
                    {/* <span className="badge bg-secondary align-middle ms-1">
                            2
                          </span> */}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "5" })}
                    onClick={() => {
                      toggleTab("5", "Pending");
                    }}
                    href="#"
                  >
                    <i className="ri-restart-line me-1 align-bottom"></i>
                    Pending
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "6" })}
                    onClick={() => {
                      toggleTab("6", "Cancel");
                    }}
                    href="#"
                  >
                    <i className="ri-close-circle-line me-1 align-bottom"></i>{" "}
                    Cancelled
                  </NavLink>
                </NavItem>
              </Nav>

              <Row className="mt-3">
                <Col sm={12} md={6} lg={2}>
                  <Label>Search By Order Id</Label>
                  <Input
                    placeholder="ORD-000000"
                    value={searchOrderId}
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        e.target.value,
                        searchCustomerName,
                        searchCustomerContactNo,
                        searchDateRange,
                        selectedDeliverySlot,
                        selectedStatus,
                        1
                      );
                      setSearchOrderId(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={3}>
                  <Label>Search By Customer First Name</Label>
                  <Input
                    placeholder="first name"
                    value={searchCustomerName}
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        searchOrderId,
                        e.target.value,
                        searchCustomerContactNo,
                        searchDateRange,
                        selectedDeliverySlot,
                        selectedStatus,
                        1
                      );
                      setSearchCustomerName(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={3}>
                  <Label>Search By Contact No</Label>
                  <Input
                    placeholder="contact no"
                    value={searchCustomerContactNo}
                    onChange={(e) => {
                      debounceHandleSearchOrderFiltration(
                        searchOrderId,
                        searchCustomerName,
                        e.target.value,
                        searchDateRange,
                        selectedDeliverySlot,
                        selectedStatus,
                        1
                      );
                      setSearchCustomerContactNo(e.target.value);
                    }}
                  />
                </Col>
                <Col sm={12} md={6} lg={4}>
                  <Label>Search By Date Range</Label>
                  <RangePicker
                    style={{ height: 40, width: "100%", borderRadius: 4 }}
                    onChange={(selectedDates) => {
                      if (selectedDates) {
                        const formattedDates = selectedDates.map((date) =>
                          date ? date.format("YYYY-MM-DD") : null
                        );
                        debounceHandleSearchOrderFiltration(
                          searchOrderId,
                          searchCustomerName,
                          searchCustomerContactNo,
                          formattedDates,
                          selectedDeliverySlot,
                          selectedStatus,
                          1
                        );
                        setSearchDateRange(formattedDates);
                      } else {
                        setSearchDateRange("");
                        debounceHandleSearchOrderFiltration(
                          searchOrderId,
                          searchCustomerName,
                          searchCustomerContactNo,
                          "",
                          selectedDeliverySlot,
                          selectedStatus,
                          1
                        );
                      }
                    }}
                  />
                </Col>

                {/* <Col sm={12} md={6} lg={3}>
                  <Label for="exampleEmail">Search by Delivery Slot</Label>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable
                    onChange={(e) => {
                      console.log(e);
                      setSelectedDeliverySlot(
                        e?.value === undefined ? "" : e === null ? "" : e.value
                      );
                      debounceHandleSearchOrderFiltration(
                        searchOrderId,
                        searchCustomerName,
                        searchCustomerContactNo,
                        searchDateRange,
                        e?.value === undefined ? "" : e === null ? "" : e.value,
                        selectedStatus,
                        1
                      );
                    }}
                    options={deliverySlotList}
                  />
                </Col> */}

                <Col sm={12} md={6} lg={3}>
                  <Label>Search By Order Status</Label>
                  <Select
                    value={
                      statusList.find(
                        (option) => option.label === selectedStatus
                      ) || null
                    }
                    className="basic-single"
                    classNamePrefix="Search order by order status"
                    isSearchable={true}
                    isClearable
                    onChange={handleChange}
                    options={statusList}
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
