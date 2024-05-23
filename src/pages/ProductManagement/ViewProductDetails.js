import { Divider, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "react-feather";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Col, Container, Row } from "reactstrap";
import parse from "html-react-parser";
import "../../assets/scss/components/viewProduct.scss";
import { getProductDetailsById } from "../../service/productService";
import { handleError } from "../../common/commonFunctions";

const ViewProductDetails = () => {
  const location = useLocation();
  const { productId } = location.state;
  const history = useNavigate();

  document.title = "Product Details | Address Shop";
  const [isRefresh, setIsRefresh] = useState(false);
  const [productDetails, setProductDetails] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    console.log(productId);
    loadProductDetailsById();
  }, [productId]);

  const loadProductDetailsById = () => {
    setProductDetails([]);
    getProductDetailsById()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        handleError(err);
      });
  };

  useEffect(() => {
    productDetails?.files && productDetails.files.length > 0
      ? productDetails.files.map((img, index) => {
          if (img?.isDefault) {
            setProductImg(img.path);
          }
        })
      : "";
  }, []);

  return (
    <div className="page-content">
      <Container fluid className="d-flex flex-row align-baseline mt-4">
        <ArrowLeft
          style={{ cursor: "pointer" }}
          size={18}
          onClick={() => {
            history("/product-management");
          }}
        />{" "}
        <h4 className="mx-2">{productDetails.name}</h4>
      </Container>
      <Container fluid>
        <Card>
          <Row className="my-4 mx-2">
            <Col sm={12} md={6} lg={6} xl={3}>
              <div className="object-fit-cover d-flex justify-content-center justify-content-xl-start justify-content-lg-start justify-content-md-start">
                {productDetails?.files && productDetails.files.length > 0 ? (
                  productDetails.files.map((img, index) => {
                    if (img?.isDefault) {
                      return (
                        <img
                          key={index} // Remember to add a unique key for each list item
                          src={img?.path}
                          alt={img?.altTag}
                          className="object-fit-cover"
                          width="80%"
                          height="auto"
                          onError={(e) =>
                            (e.target.src =
                              "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                          }
                        />
                      );
                    }
                  })
                ) : (
                  <img
                    src="https://i.ibb.co/qpB9ZCZ/placeholder.png"
                    alt="placeholder"
                    className="object-fit-cover"
                    width="80%"
                    height="auto"
                  />
                )}
              </div>
            </Col>
            <Col
              sm={12}
              md={6}
              lg={6}
              xl={7}
              className="mt-5 mt-xl-1  mt-lg-1  mt-md-1 text-xl-start text-lg-start text-md-start text-center d-flex flex-column align-items-center align-items-md-start"
            >
              <h4>{productDetails?.name}</h4>

              {productDetails?.fromPrice === null ? (
                <h5 className="product-data my-3">
                  From LKR : <Tag>Not Send</Tag>
                </h5>
              ) : (
                <h5 className="product-data my-3">
                  From LKR{" "}
                  {parseFloat(productDetails?.fromPrice).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </h5>
              )}

              <div
                className="d-flex align-items-center position-relative "
                style={{ width: "fit-content", paddingRight: 40 }}
              >
                <h5 className="product-data my-2">
                  Category : {productDetails?.category?.name}{" "}
                </h5>
                <div
                  className="color-div"
                  style={{
                    backgroundColor: `#${productDetails?.category?.color}`,
                  }}
                ></div>
              </div>

              <h5 className="product-data my-3">
                Status :
                <Tag
                  className="ms-3 fs-6 "
                  color={
                    productDetails?.status === 1
                      ? "success"
                      : productDetails?.status === 2
                      ? "error"
                      : "default"
                  }
                  key={productDetails?.status}
                >
                  {productDetails?.status === 1
                    ? "ACTIVE"
                    : productDetails?.status === 2
                    ? "INACTIVE"
                    : "none"}
                </Tag>
              </h5>
            </Col>

            <Col
              sm={12}
              md={12}
              lg={12}
              xl={2}
              className="d-flex justify-content-center justify-content-md-end align-items-start mt-5 mt-xl-5"
            >
              <button
                type="button"
                onClick={() =>
                  history("/update-product", {
                    state: { productDetails: productDetails.id },
                  })
                }
                className="btn btn-primary w-sm me-4"
              >
                Update Product
              </button>
            </Col>

            {/* <Col sm={12} md={12} lg={12} xl={12}>
              <h5 className="product-data my-3 text-center text-md-start mt-5">
                {parse(productDetails?.description)}
              </h5>
            </Col> */}
          </Row>
          <Divider className="my-5" />
          <Row className="px-4 mb-4">
            {/* <Row>
              <Col
                className=" d-flex justify-content-end"
                sm={12}
                md={12}
                lg={12}
                xl={12}
              >
                <Pagination
                  className="my-3"
                  current={currentPage}
                  onChange={onChangePagination}
                  total={totalRecodes}
                  defaultPageSize={12}
                  showTotal={(total) => `Total ${total} items`}
                />
              </Col>
            </Row> */}
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default ViewProductDetails;
