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
  Row,
  Col,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import { AntDesignOutlined } from "@ant-design/icons";
import { Avatar, Tag } from "antd";
import moment from "moment";

const ViewPaymentModal = ({ isOpen, currentData, onClose }) => {
  useEffect(() => {
    console.log(currentData, "62596235+++++++++++++++");
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        onClose();
      }}
    >
      <ModalHeader
        toggle={() => {
          onClose();
        }}
      >
        Payment Details
      </ModalHeader>
      <ModalBody>
        <Row className="d-flex justify-content-center">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  {currentData?.order?.orderCode}
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
                  {currentData?.order?.trackingCode || " - "}
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
                  {currentData?.order?.netTotal}
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
                  {currentData?.order?.shippingFee}
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
                  {currentData?.order?.subTotal}
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
                  {currentData?.order?.discountAmount || " - "}
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
                  <Tag
                    color={
                      currentData?.order?.status === "PENDING"
                        ? "warning"
                        : currentData?.order?.status === "PROCESSING"
                        ? "processing"
                        : currentData?.order?.status === "SHIPPED"
                        ? "purple"
                        : currentData?.order?.status === "DELIVERED"
                        ? "success"
                        : currentData?.order?.status === "CANCELLED"
                        ? "error"
                        : currentData?.order?.status === "REJECTED"
                        ? "magenta"
                        : "default"
                    }
                    key={currentData?.order?.status}
                  >
                    {currentData?.order?.status === "PENDING"
                      ? "PENDING"
                      : currentData?.order?.status === "PROCESSING"
                      ? "PROCESSING"
                      : currentData?.order?.status === "SHIPPED"
                      ? "SHIPPED"
                      : currentData?.order?.status === "DELIVERED"
                      ? "DELIVERED"
                      : currentData?.order?.status === "CANCELLED"
                      ? "CANCELLED"
                      : currentData?.order?.status === "REJECTED"
                      ? "REJECTED"
                      : "none"}
                  </Tag>
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
                  <Tag
                    color={
                      currentData?.status === "SUCCESS"
                        ? "success"
                        : currentData?.status === "FAILED"
                        ? "error"
                        : currentData?.status === "REFUNDED"
                        ? "warning"
                        : currentData?.status === "CANCELLED"
                        ? "orange"
                        : "default"
                    }
                    key={currentData?.status}
                  >
                    {currentData?.status === "SUCCESS"
                      ? "SUCCESS"
                      : currentData?.status === "FAILED"
                      ? "FAILED"
                      : currentData?.status === "REFUNDED"
                      ? "REFUNDED"
                      : currentData?.status === "CANCELLED"
                      ? "CANCELLED"
                      : "none"}
                  </Tag>
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
                  Order Placed At
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  {moment(currentData?.order?.createdAt).format(
                    "MMMM Do YYYY, h:mm A"
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
                  Payment Date
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  {moment(currentData?.createdAt).format(
                    "MMMM Do YYYY, h:mm A"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            onClose();
          }}
        >
          Close
        </Button>{" "}
      </ModalFooter>
    </Modal>
  );
};

export default ViewPaymentModal;
