import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  CardHeader,
  Collapse,
  Button,
} from "reactstrap";

import classnames from "classnames";
import { Link } from "react-router-dom";

// import { productDetails } from "../../../common/data/ecommerce";
// import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import { useLocation } from "react-router-dom";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { ArrowLeft } from "react-feather";
import { useDispatch } from "react-redux";
import moment from "moment";
import Select from "react-select";
import {
  getAllOrderStatus,
  getOrderByOrderId,
  updateOrdersStatus,
} from "../../service/orderService";
import { useNavigate } from "react-router-dom";

// import defaultUser from "../../../assets/images/default_user_img.png";
import { Tag } from "antd";
import OrderItems from "./OrderItems";

const OrderDetail = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const history = useNavigate();

  const [col1, setcol1] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [col3, setcol3] = useState(true);
  const [orderDetails, setOrderDetails] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [isBtnDisable, setIsBtnDisable] = useState(true);
  //   const [orderDetails, setorderDetails] = useState();

  const [toggleUpdateAddressModal, setToggleUpdateAddressModal] =
    useState(false);
  const [modalName, setModalName] = useState("");
  const [addressObj, setAddressObj] = useState("");
  const [orderId, setOrderId] = useState("");

  // useEffect(() => {
  //   const { state } = location;
  //   const { orderData } = state;
  //   loadAllOrderStatus();
  //   console.log(orderData);
  //   setOrderDetails(orderData);
  //   setSelectedStatus(orderDetails?.order_status);
  // }, [orderDetails]);

  useEffect(() => {
    const { state } = location;
    if (state && state.orderData) {
      const { orderData } = state;
      console.log(orderData, "1010101010101011");
      setOrderId(orderData);
      getOrderDetails(orderData);
    }
  }, [location]);

  const getOrderDetails = (orderId) => {
    console.log(orderId, "============");
    popUploader(dispatch, true);
    setOrderDetails([]);
    getOrderByOrderId(orderId)
      .then((res) => {
        console.log(res);
        let response = res?.data;
        setOrderDetails(response);
        // loadAllOrderStatus(response?.timelines, response?.payment);
        setSelectedStatus(response?.status);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        console.log(err);
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  // const loadAllOrderStatus = (timelines, payment) => {
  //   setStatusList([]);
  //   let temp = [];
  //   popUploader(dispatch, true);
  //   getAllOrderStatus()
  //     .then((resp) => {
  //       for (let key in resp?.data) {
  //         let disabled = false;
  //         if (timelines) {
  //           timelines.forEach((timeline) => {
  //             if (resp?.data[key] === timeline.type) {
  //               disabled = true;
  //             }
  //           });
  //         }
  //         if (payment?.status === "PAID" && resp?.data[key] === "Cancel") {
  //           continue;
  //         }

  //         temp.push({
  //           value: key,
  //           label: resp?.data[key],
  //           isDisabled: disabled,
  //         });
  //       }
  //       setStatusList(temp);
  //       popUploader(dispatch, false);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       popUploader(dispatch, false);
  //       handleError(err);
  //     });
  // };

  const updateStatusOfOrder = () => {
    // let temp = {
    //   status: selectedStatus,
    // };
    // console.log(temp);
    // popUploader(dispatch, true);
    // updateOrdersStatus(temp, orderDetails?.id)
    //   .then((res) => {
    //     popUploader(dispatch, false);
    //     customToastMsg("Order status updated successfully", 1);
    //     getOrderDetails(orderId);
    //   })
    //   .catch((c) => {
    //     popUploader(dispatch, false);
    //     handleError(c);
    //   });
  };

  function togglecol1() {
    setcol1(!col1);
  }

  const handleChange = (e) => {
    let status = e?.label;
    console.log(status);
    setSelectedStatus(status);
    setIsBtnDisable(false);
  };

  // const toggleAddressModal = (modalName) => {
  //   setModalName(modalName);
  //   setToggleUpdateAddressModal(!toggleUpdateAddressModal);
  //   getOrderDetails(orderId);

  //   modalName === "Billing Address"
  //     ? setAddressObj({
  //         orderId: orderDetails?.id,
  //         address: orderDetails?.billingAddress,
  //       })
  //     : modalName === "Shipping Address"
  //     ? setAddressObj({
  //         orderId: orderDetails?.id,
  //         address: orderDetails?.shippingAddress,
  //       })
  //     : "";
  // };

  document.title = "Order Details | Easy Kitchen";
  return (
    <div className="page-content">
      {/* <OrderAddressUpdateModal
        isOpen={toggleUpdateAddressModal}
        toggle={toggleAddressModal}
        modalName={modalName}
        orderDetails={addressObj}
      /> */}
      <Container fluid className="d-flex flex-row align-baseline mt-4">
        <ArrowLeft
          style={{ cursor: "pointer" }}
          size={18}
          onClick={() => {
            history("/order-management");
          }}
        />{" "}
        <h4 className="mx-2">{orderDetails.orderId}</h4>
      </Container>
      <Container fluid>
        <Row>
          <Col xl={9}>
            <Card>
              <CardHeader>
                <div className="d-flex align-items-center">
                  <h5 className="card-title flex-grow-1 mb-0">
                    Order Number : {orderDetails.orderCode}
                  </h5>
                  <div className="flex-shrink-0">
                    {/*<Button*/}
                    {/*    color='primary'*/}
                    {/*    // to="/apps-invoices-details"*/}
                    {/*    className="btn btn-primary "*/}
                    {/*>*/}
                    {/*    <i className="ri-download-2-fill align-middle me-1"></i>{" "}*/}
                    {/*    Invoice*/}
                    {/*</Button>*/}
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                <div className="table-responsive table-card">
                  <table className="table table-nowrap align-middle table-borderless mb-0">
                    <thead className="table-light text-muted">
                      <tr>
                        <th scope="col-2">Product Details</th>
                        <th className="text-center" scope="col">
                          Quantity
                        </th>
                        <th className="text-center" scope="col">
                          Item Price
                        </th>
                        <th className="text-center" scope="col">
                          Item Price (with discount)
                        </th>
                        <th className="text-center" scope="col">
                          Total Amount{" "}
                        </th>
                        <th className="text-end" scope="col">
                          Total Amount (with discount)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <OrderSubProduct data={orderDetails?.packs} /> */}
                      <OrderItems data={orderDetails?.orderItems} />

                      <tr className="border-top border-top-dashed">
                        <td colSpan="4"></td>
                        <td colSpan="2" className="fw-medium p-0">
                          <table className="table table-borderless mb-0">
                            <tbody>
                              <tr>
                                <td>Sub Total : </td>
                                <td className="text-end">
                                  LKR{" "}
                                  {parseFloat(orderDetails?.subTotal).toFixed(
                                    2
                                  )}
                                </td>
                              </tr>
                              {/*<tr>*/}
                              {/*    <td>*/}
                              {/*        Discount{" "}:*/}
                              {/*    </td>*/}
                              {/*    <td className="text-end">-$53.99</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*    <td>Shipping Charge :</td>*/}
                              {/*    <td className="text-end">$65.00</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*    <td>Estimated Tax :</td>*/}
                              {/*    <td className="text-end">$44.99</td>*/}
                              {/*</tr>*/}
                              <tr className="border-top border-top-dashed">
                                <th scope="row">Total :</th>
                                <th className="text-end">
                                  LKR{" "}
                                  {parseFloat(orderDetails.netTotal).toFixed(2)}
                                </th>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="d-sm-flex align-items-center">
                  <h5 className="card-title flex-grow-1 mb-0">Order Status</h5>

                  <>
                    <div className={"mx-2"}>
                      <Select
                        value={
                          statusList.find(
                            (option) => option.label === selectedStatus
                          ) || null
                        }
                        className="basic-single"
                        classNamePrefix="Search order by order status"
                        isSearchable={true}
                        onChange={handleChange}
                        options={statusList}
                      />
                    </div>

                    <Button
                      disabled={isBtnDisable}
                      color={"primary"}
                      onClick={() => {
                        updateStatusOfOrder();
                      }}
                    >
                      Update Order Status
                    </Button>
                  </>

                  {/* <div className="flex-shrink-0 mt-2 mt-sm-0">*/}
                  {/*        <span*/}
                  {/*            className={`btn */}
                  {/*            ${orderDetails?.order_status === 'PAYMENT PENDING' ? 'btn-soft-warning'*/}
                  {/*                : 'btn-soft-primary'} btn-sm mt-2 mt-sm-0`}*/}
                  {/*        >*/}
                  {/*            {orderDetails?.order_status}*/}
                  {/*        </span>{" "}*/}
                  {/*</div> */}
                </div>
              </CardHeader>
              <CardBody>
                <div className="profile-timeline">
                  <div
                    className="accordion accordion-flush"
                    id="accordionFlushExample"
                  >
                    {orderDetails?.timelines?.map((timeline, index) => (
                      <div key={index}>
                        <div
                          className="accordion-item border-0"
                          onClick={togglecol1}
                        >
                          <div className="accordion-header" id="headingOne">
                            <Link
                              to="#"
                              className={classnames(
                                "accordion-button",
                                "p-2",
                                "shadow-none",
                                { collapsed: !col1 }
                              )}
                            >
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 avatar-xs">
                                  <div className="avatar-title bg-primary rounded-circle">
                                    <i className="ri-shopping-bag-line"></i>
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="fs-15 mb-0 fw-semibold">
                                    {timeline?.orderStatus?.name}
                                  </h6>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <Collapse
                            id="collapseOne"
                            className="accordion-collapse"
                            isOpen={col1}
                          >
                            <div className="accordion-body ms-2 ps-5 pt-0">
                              <h6 className="mb-1">
                                This order has reached{" "}
                                {timeline?.orderStatus?.name} status on
                              </h6>
                              <p className="text-muted">
                                {moment(timeline?.createdAt).format(
                                  "ddd, DD MMM YYYY - h:mmA"
                                )}
                              </p>
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    ))}{" "}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={3}>
            <Card>
              <CardHeader>
                <div className="d-flex">
                  <h5 className="card-title flex-grow-1 mb-0">
                    <i className="mdi mdi-truck-fast-outline align-middle me-1 text-muted"></i>
                    Order Details
                  </h5>
                  {/* <div className="flex-shrink-0">
                    <Link
                      to="#"
                      className="badge bg-primary-subtle text-primary fs-11"
                    >
                      Track Order
                    </Link>
                  </div> */}
                </div>
              </CardHeader>
              <CardBody>
                <div>
                  <p className=" mb-0">
                    Order Id :{" "}
                    <span className="fw-semibold">
                      {orderDetails?.orderCode}
                    </span>
                  </p>

                  <p className="text-muted mb-2 mx-3">
                    Order Description : {orderDetails?.description}
                  </p>

                  <p className="mb-2">
                    Order Placed Date :{" "}
                    <span className="fw-semibold">
                      {moment(orderDetails?.createdAt).format(
                        "ddd, DD MMM YYYY - h:mmA"
                      )}
                    </span>
                  </p>
                  {/* <p className="mb-2">
                    Order Date :{" "}
                    <span className="fw-semibold">
                      {moment(orderDetails?.orderDate).format(
                        "ddd, DD MMM YYYY - h:mmA"
                      )}
                    </span>
                  </p> */}
                  {/* <p className="mb-2">Delivery Option : timeslot </p> */}
                  {/* <p className="mb-2">
                    Order Type :{" "}
                    <Tag color="blue">{orderDetails?.deliveryType?.type}</Tag>
                  </p> */}
                  {/* <p className="mb-2">
                    Specific Des : {orderDetails?.paymentMethod?.type}
                  </p> */}
                  {/* <p className="mb-2">
                    Payment : LKR{" "}
                    <span className="fw-semibold">
                      {parseFloat(orderDetails?.payment?.amount).toFixed(2)}
                    </span>
                  </p> */}
                  <p className="mb-2">
                    Payment Status :{" "}
                    <Tag color="blue">{orderDetails?.payment?.status}</Tag>
                  </p>
                  <p className="mb-2">
                    Payment Mode :{" "}
                    <Tag color="blue">{orderDetails?.paymentType}</Tag>
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="d-flex">
                  <h5 className="card-title flex-grow-1 mb-0">
                    Customer Details
                  </h5>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="list-unstyled mb-0 vstack gap-3">
                  <li>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        {orderDetails?.orderCustomer?.photo ? (
                          <img
                            src={orderDetails?.orderCustomer?.photo?.path}
                            alt="customer"
                            className="avatar-sm rounded"
                          />
                        ) : (
                          <img
                            src={""}
                            alt="customer"
                            className="avatar-sm rounded"
                          />
                        )}
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <p className="text-muted mb-0">Customer</p>
                        <h6 className="fs-14 mb-1">
                          {" "}
                          {orderDetails?.orderCustomer?.firstName}{" "}
                          {orderDetails?.orderCustomer?.lastName}
                        </h6>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 ms-3">
                        <p className="text-muted mb-0">Email</p>
                        <h6 className="fs-14 mb-1">
                          {" "}
                          {orderDetails?.orderCustomer?.email}
                        </h6>
                      </div>
                    </div>
                  </li>{" "}
                  {/* <li>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 ms-3">
                        <p className="text-muted mb-0">Address</p>
                        <h6 className="fs-14 mb-1">
                          {" "}
                          {orderDetails?.orderCustomer?.address}
                        </h6>
                      </div>
                    </div>
                  </li> */}
                  <li>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 ms-3">
                        <p className="text-muted mb-0">Contact</p>
                        <h6 className="fs-14 mb-1">
                          {" "}
                          {orderDetails?.orderCustomer?.contactNo}
                        </h6>
                      </div>
                    </div>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between">
                  <h5 className="card-title mb-0">
                    <i className="ri-map-pin-line align-middle me-1 text-muted"></i>{" "}
                    Billing Details
                  </h5>

                  {/* <Button
                      color="primary"
                      onClick={() => {
                        toggleAddressModal("Billing Address");
                      }}
                    >
                      Update
                    </Button> */}
                </div>
              </CardHeader>
              <CardBody>
                <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
                  <li className="fw-medium fs-14">
                    {orderDetails?.billingDetail?.firstName}{" "}
                    {orderDetails?.billingDetail?.lastName}
                  </li>
                  <li>{orderDetails?.billingDetail?.contactNo}</li>
                  <li>{orderDetails?.billingDetail?.email}</li>
                  <li>{orderDetails?.billingDetail?.postalCode}</li>
                  <li>{orderDetails?.billingDetail?.country}</li>
                  <li>{orderDetails?.billingDetail?.province}</li>
                  <li>{orderDetails?.billingDetail?.state}</li>
                  <li>{orderDetails?.billingDetail?.city}</li>
                  <li>{orderDetails?.billingDetail?.addressLine1}</li>
                  <li>{orderDetails?.billingDetail?.addressLine2}</li>
                  <li>
                    Postal code :{orderDetails?.billingDetail?.postalCode}
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between">
                  <h5 className="card-title mb-0">
                    <i className="ri-map-pin-line align-middle me-1 text-muted"></i>{" "}
                    Shipping Details
                  </h5>

                  {/* <Button
                      color="primary"
                      onClick={() => {
                        toggleAddressModal("Shipping Address");
                      }}
                    >
                      Update
                    </Button> */}
                </div>
              </CardHeader>
              <CardBody>
                <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
                  <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
                    <li className="fw-medium fs-14">
                      {orderDetails?.shippingDetail?.firstName}{" "}
                      {orderDetails?.shippingDetail?.lastName}
                    </li>
                    <li>{orderDetails?.shippingDetail?.contactNo}</li>
                    <li>{orderDetails?.shippingDetail?.email}</li>
                    <li>{orderDetails?.shippingDetail?.postalCode}</li>
                    <li>{orderDetails?.shippingDetail?.country}</li>
                    <li>{orderDetails?.shippingDetail?.province}</li>
                    <li>{orderDetails?.shippingDetail?.state}</li>
                    <li>{orderDetails?.shippingDetail?.city}</li>
                    <li>{orderDetails?.shippingDetail?.addressLine1}</li>
                    <li>{orderDetails?.shippingDetail?.addressLine2}</li>
                    <li>
                      Postal code :{orderDetails?.shippingDetail?.postalCode}
                    </li>
                  </ul>
                </ul>
              </CardBody>
            </Card>

            {/*<Card>*/}
            {/*    <CardHeader>*/}
            {/*        <h5 className="card-title mb-0">*/}
            {/*            <i className="ri-secure-payment-line align-bottom me-1 text-muted"></i>{" "}*/}
            {/*            Payment Details*/}
            {/*        </h5>*/}
            {/*    </CardHeader>*/}
            {/*    <CardBody>*/}
            {/*        <div className="d-flex align-items-center mb-2">*/}
            {/*            <div className="flex-shrink-0">*/}
            {/*                <p className="text-muted mb-0">Transactions:</p>*/}
            {/*            </div>*/}
            {/*            <div className="flex-grow-1 ms-2">*/}
            {/*                <h6 className="mb-0">#VLZ124561278124</h6>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className="d-flex align-items-center mb-2">*/}
            {/*            <div className="flex-shrink-0">*/}
            {/*                <p className="text-muted mb-0">Payment Method:</p>*/}
            {/*            </div>*/}
            {/*            <div className="flex-grow-1 ms-2">*/}
            {/*                <h6 className="mb-0">Debit Card</h6>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className="d-flex align-items-center mb-2">*/}
            {/*            <div className="flex-shrink-0">*/}
            {/*                <p className="text-muted mb-0">Card Holder Name:</p>*/}
            {/*            </div>*/}
            {/*            <div className="flex-grow-1 ms-2">*/}
            {/*                <h6 className="mb-0">Joseph Parker</h6>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className="d-flex align-items-center mb-2">*/}
            {/*            <div className="flex-shrink-0">*/}
            {/*                <p className="text-muted mb-0">Card Number:</p>*/}
            {/*            </div>*/}
            {/*            <div className="flex-grow-1 ms-2">*/}
            {/*                <h6 className="mb-0">xxxx xxxx xxxx 2456</h6>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className="d-flex align-items-center">*/}
            {/*            <div className="flex-shrink-0">*/}
            {/*                <p className="text-muted mb-0">Total Amount:</p>*/}
            {/*            </div>*/}
            {/*            <div className="flex-grow-1 ms-2">*/}
            {/*                <h6 className="mb-0">$415.96</h6>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </CardBody>*/}
            {/*</Card>*/}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderDetail;
