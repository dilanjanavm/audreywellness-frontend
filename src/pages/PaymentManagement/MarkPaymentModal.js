// import { addPayment } from "../../../service/paymentService";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  Row,
} from "reactstrap";
import { Switch, Tag } from "antd";

import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";

import { useDispatch } from "react-redux";
import moment from "moment";

function MarkPaymentModal({ isOpen, currentData, onClose }) {
  const dispatch = useDispatch();

  customSweetAlert(`Do you want to mark this payment?`, 2, () => {
    popUploader(dispatch, true);
    let data = {
      orderId: currentData?.id,
    };
    addPayment(data)
      .then((res) => {
        customToastMsg("Payment added  successfully", 1);
        popUploader(dispatch, false);
        onClose();
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  });

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Mark Payment</ModalHeader>
      <ModalBody>
        <h4>Order Id : {currentData?.orderId}</h4>
        <h5 className="fw-normal my-3 fs-16">
          Order Amount : LKR {parseFloat(currentData?.total).toFixed(2)}
        </h5>
        <h5 className="fw-normal my-3 fs-16">
          Payment Method :{" "}
          <Tag
            style={{ fontSize: 15, padding: "3px 6px" }}
            icon={
              currentData?.paymentMethod?.code === "COD" ? (
                <Icon
                  width="1.2em"
                  height="1.2em"
                  icon="vaadin:cash"
                  className="me-2 mb-1 align-center"
                  style={{ color: "#0958d9" }}
                />
              ) : currentData?.paymentMethod?.code === "CP" ? (
                <Icon
                  width="1.2em"
                  height="1.2em"
                  icon="ph:credit-card"
                  className="me-2 mb-1 align-center"
                  style={{ color: "#0958d9" }}
                />
              ) : (
                "default"
              )
            }
            color={
              currentData?.paymentMethod?.code === "COD"
                ? "processing"
                : currentData?.paymentMethod?.code === "CP"
                  ? "processing"
                  : "default"
            }
            key={currentData?.paymentMethod?.code}
          >
            {currentData?.paymentMethod?.code === "COD"
              ? "CASH ON DELIVERY"
              : currentData?.paymentMethod?.code === "CP"
                ? "CARD PAYMENT"
                : "none"}
          </Tag>{" "}
        </h5>
        <h5 className="fw-normal my-3 fs-16">
          Customer name :{" "}
          {currentData?.orderCustomer?.firstName +
            " " +
            currentData?.orderCustomer?.lastName}
        </h5>
        <h5 className="fw-normal my-3 fs-16">
          Contact No : {currentData?.orderCustomer?.contactNo}
        </h5>
        {currentData?.payment && currentData?.payment.length > 0 && (
          <h5 className="fw-normal my-3 fs-16">
            Payment history :{" "}
            <Row className="px-2 mt-3">
              <h5 className="col-5 fs-16">Payment Date </h5>
              <h5 className="col-4 fs-16">Amount</h5>
              <h5 className="col-2 fs-16">Status</h5>
            </Row>
            {currentData?.payment.map((pay, index) => {
              return (
                <Row className="px-2 mt-2">
                  <h5 className="col-5 fs-15 fw-normal">
                    {moment(pay?.createdAt).format("YYYY-MM-DD HH:mm A")}
                  </h5>
                  <h5 className="col-4 fs-15 fw-normal">
                    LKR {parseFloat(pay?.amount).toFixed(2)}
                  </h5>
                  <div className="col-2 fs-15 fw-normal">
                    {" "}
                    <Tag
                      style={{ fontSize: 14, padding: 3 }}
                      color={
                        pay?.status === "PENDING"
                          ? "warning"
                          : pay?.status === "PAID"
                            ? "success"
                            : pay?.status === "FAIL"
                              ? "error"
                              : "default"
                      }
                      key={pay?.status}
                    >
                      {pay?.status === "PENDING"
                        ? "PENDING"
                        : pay?.status === "PAID"
                          ? "PAID"
                          : pay?.status === "FAIL"
                            ? "FAIL"
                            : "none"}
                    </Tag>{" "}
                  </div>
                </Row>
              );
            })}
          </h5>
        )}
        {currentData?.paymentMethod?.code === "COD" &&
          (currentData?.payment?.length === 0 ||
            (currentData?.payment?.length > 0 &&
              currentData?.payment[0]?.status === "PENDING")) && (
            <Button
              color="primary"
              className="w-100 mt-2"
              onClick={makePayment}
            >
              Mark Payment as Paid
            </Button>
          )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>{" "}
      </ModalFooter>
    </Modal>
  )
}

export default MarkPaymentModal