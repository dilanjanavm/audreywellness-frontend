import React, { useEffect, useState } from "react";
import "../../../assets/scss/components/productCard.scss";
import { Col } from "reactstrap";
import { MoreVertical } from "react-feather";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
} from "../../../common/commonFunctions";
import { useNavigate } from "react-router-dom";
import { Button, Popover, Switch, Tag, Tooltip } from "antd";
import { useDispatch } from "react-redux";
import * as productService from "../../../service/productVariantService";

const ProductCard = ({ productData, reload }) => {
  const history = useNavigate();
  const dispatch = useDispatch();

  const [categoryColor, setCategoryColor] = useState("");
  const [isDeleted, setIsDeleted] = useState(0);

  useEffect(() => {
    // console.log(productData, "*********************");
  }, []);

  useEffect(() => {
    let temp = [];
    console.log(productData, "0000000000");

    setCategoryColor(
      productData?.category?.color != ""
        ? productData?.category?.color
        : "ffffff"
    );
    console.log(productData?.category?.color);
  }, []);

  const handleDeleteProduct = (productId) => {
    console.log(productId);

    customSweetAlert("Are you sure to delete this product?", 0, () => {
      popUploader(dispatch, true);

      deleteProduct(productId)
        .then((res) => {
          customToastMsg("Product deleted successfully", 1);
          reload();
          let temp = isDeleted;
          setIsDeleted(++temp);
          popUploader(dispatch, false);
        })
        .catch((c) => {
          popUploader(dispatch, false);
          handleError(c);
        });
    });
  };

  const changeStatusProduct = (productData) => {
    const newStatus = productData.status === 1 ? 2 : 1;
    customSweetAlert(
      productData.status === 1
        ? "Do you want to deactivate this product?"
        : "Do you want to activate this product?",
      2,
      () => {
        popUploader(dispatch, true);
        productService
          .activeInactiveProduct(productData.id, newStatus)
          .then((res) => {
            popUploader(dispatch, false);
            customToastMsg(
              `Product ${1 ? "deactivated" : "activated"} successfully`,
              1
            );
            reload();
          })
          .catch((c) => {
            popUploader(dispatch, false);
            handleError(c);
          });
      },
      productData.status === 1 ? "Product Deactivate" : "Product Activate"
    );
  };

  const updateProductDetails = () => {
    console.log(productData);
    // history("/update-product", {
    //   state: { productId: productData?.id },
    // });
  };

  const viewMoreProductDetails = () => {
    history("/product-view", { state: { productId: productData?.id } });
  };
  const content = (
    <div className="d-flex flex-column">
      <Button
        className="menu-view-btn"
        onClick={() => {
          viewMoreProductDetails();
        }}
        type="text"
      >
        View
      </Button>

      <Button
        className="menu-view-btn"
        onClick={() => {
          updateProductDetails();
        }}
        type="text"
      >
        Update
      </Button>

      <Button
        className="menu-view-btn"
        onClick={(e) => {
          handleDeleteProduct(productData?.id);
        }}
        type="text"
      >
        Delete
      </Button>
    </div>
  );
  return (
    <Col sm={6} md={4} lg={3} xl={3} xxl={2} className="my-2 ">
      <div
        className="product-single-card"
        style={{
          borderBottom: `6px solid #${categoryColor}`,
        }}
      >
        <div className="product-top-area">
          <div
            className="product-img"
            // style={{ height: 140, width: "auto" }}
          >
            <div className="first-view w-100 h-100 object-fit-cover">
              {productData?.file && productData?.file.length > 0 ? (
                <img
                  className="w-100 h-100 object-fit-cover"
                  // key={index}
                  src={productData?.file[0]?.originalPath}
                  alt="productIamge"
                  // alt={img?.altTag}
                  onError={(e) =>
                    (e.target.src = "https://i.ibb.co/qpB9ZCZ/placeholder.png")
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
          </div>
          <div className="sideicons">
            <div className="menu-div">
              {" "}
              <Popover placement="bottomLeft" content={content}>
                <MoreVertical color="#332321" size={20} />
              </Popover>
            </div>
          </div>
        </div>
        <div className="product-info">
          <div
            onClick={() => {
              viewMoreProductDetails();
            }}
          >
            <h6 className="product-category text-truncate d-flex">
              <Tooltip title={productData?.category?.categoryHierarchy}>
                {productData?.category?.categoryHierarchy}
              </Tooltip>
            </h6>

            <h6 className="product-title text-truncate">
              <Tooltip title={productData?.name}>{productData?.name}</Tooltip>
            </h6>
            {productData?.priceRange && (
              <h6 className="product-category text-truncate d-flex">
                {/* <Tooltip title={productData?.priceRange}>
                {"LKR " + productData?.priceRange.range}
              </Tooltip> */}
                {/* <Tooltip title={productData?.priceRange}>
                {typeof productData?.priceRange === "object"
                  ? "LKR " + productData?.priceRange.range
                  : "LKR " + productData?.priceRange}
              </Tooltip> */}
                <Tooltip title={productData?.priceRange}>
                  {productData?.priceRange &&
                  typeof productData?.priceRange === "object"
                    ? "LKR " + productData?.priceRange.range
                    : "LKR " + (productData?.priceRange || "N/A")}
                </Tooltip>
              </h6>
            )}

            {/* <h6 className="product-category text-truncate d-flex">
            <Tooltip title={productData?.priceRange?.range || "N/A"}>
              {"LKR " + (productData?.priceRange?.range || "N/A")}
            </Tooltip>
          </h6> */}
          </div>
          <h6 className="product-title text-truncate" style={{ zIndex: 10 }}>
            <Switch
              checked={
                productData.status === 1
                  ? true
                  : productData.status === 2
                  ? false
                  : false
              }
              onChange={(e) => {
                changeStatusProduct(productData);
              }}
              handleBg={productData.status === 1 ? "#60b24c" : "#bababa"}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              style={{
                backgroundColor:
                  productData.status === 1 ? "#60b24c" : "#bababa",
              }}
            />
          </h6>
        </div>
      </div>
    </Col>
  );
};

export default ProductCard;
