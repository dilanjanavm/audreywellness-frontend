import React, { useState } from "react";
import { Badge } from "reactstrap";
import { Avatar, Tag } from "antd";

const OrderItems = ({ data }) => {
  return (
    <React.Fragment>
      {data?.map((orderItem, index) => (
        <>
          {console.log("Order Item:", orderItem)}
          <tr>
            <td>
              <div className="d-flex">
                <div className="flex-shrink-0 avatar-md bg-light rounded p-1">
                  {orderItem?.productBaseVariant?.file ? (
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={orderItem?.productBaseVariant?.file[0]?.originalPath}
                      alt="img"
                      onError={(e) =>
                        (e.target.src =
                          "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                      }
                    />
                  ) : (
                    <img
                      src="https://i.ibb.co/qpB9ZCZ/placeholder.png"
                      alt="placeholder"
                      className="w-100 h-100 object-fit-cover"
                    />
                  )}
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-15">
                    {orderItem?.productBaseVariant.name}
                  </h5>

                  <p className="text-muted mb-0">
                    Discount:{" "}
                    {orderItem.discount ? (
                      <span className="fw-medium">{orderItem.discount}%</span>
                    ) : (
                      "No Discount"
                    )}
                  </p>
                  {/* <h6
                    className="text-primary mt-3 cursor-pointer text-decoration-underline"
                    // onClick={() => {
                    //   setIsToggleModal(!isToggleModal);
                    //   setSelectedPackage(orderItem?.id);
                    // }}
                  >
                    View Item Details
                  </h6> */}
                </div>
              </div>
            </td>

            <td className="text-center"> {orderItem.qty}</td>
            <td className="text-center">
              LKR {parseFloat(orderItem?.sellingPrice).toFixed(2)}
            </td>
            <td className="text-center">
              LKR{" "}
              {parseFloat(
                // (orderItem?.sellingPrice * (100 - orderItem?.discount)) / 100
                (orderItem?.sellingPrice * (100 - 0)) / 100
              ).toFixed(2)}
            </td>
            <td className="fw-medium text-center">
              LKR{" "}
              {parseFloat(orderItem?.sellingPrice * orderItem.qty).toFixed(2)}
            </td>
            <td className="fw-medium text-end">
              LKR{" "}
              {parseFloat(
                // ((orderItem?.sellingPrice * (100 - orderItem?.discount)) /
                ((orderItem?.sellingPrice * (100 - 0)) / 100) * orderItem.qty
              ).toFixed(2)}
            </td>
          </tr>
        </>
      ))}
    </React.Fragment>
  );
};

export default OrderItems;
