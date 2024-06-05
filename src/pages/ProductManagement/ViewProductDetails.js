import { Carousel, Divider, Pagination, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "react-feather";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Col, Container, Row } from "reactstrap";
import parse from "html-react-parser";
import "../../assets/scss/components/viewProduct.scss";
import { handleError } from "../../common/commonFunctions";
import { getProductBaseVariationDetailsById } from "../../service/productBaseVariationService";
import ProductCard from "../../Components/Common/cards/ProductCard";

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
    getProductBaseVariationDetailsById(productId)
      .then((res) => {
        setProductDetails(res?.data);
      })
      .catch((err) => {
        handleError(err);
      });
  };

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
                {productDetails?.file ? (
                  <Carousel autoplay>
                    {productDetails?.file.map((img, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-center"
                      >
                        <img
                          src={img?.originalPath}
                          alt={img?.altTag}
                          className="object-fit-cover"
                          width="80%"
                          height="auto"
                          onError={(e) =>
                            (e.target.src =
                              "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                          }
                        />
                      </div>
                    ))}
                  </Carousel>
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

              <div
                className="object-fit-cover d-flex justify-content-center justify-content-xl-start justify-content-lg-start "
                style={{ height: "100%", width: "100%" }}
              ></div>
            </Col>
            <Col
              sm={12}
              md={6}
              lg={6}
              xl={7}
              className="mt-5 mt-xl-1  mt-lg-1  mt-md-1 text-xl-start text-lg-start text-md-start text-center d-flex flex-column align-items-center align-items-md-start"
            >
              <h4>{productDetails?.name}</h4>

              <h5 className="product-data my-2">
                This is a product variant of {productDetails?.product?.name}
              </h5>

              <h5 className="product-data my-2">
                {productDetails?.baseVariant?.attribute?.name} :{" "}
                {productDetails?.baseVariant?.attribute?.tag?.name}{" "}
              </h5>

              <h5 className="product-data my-2">
                Category : {productDetails?.category?.categoryHierarchy}{" "}
              </h5>
              {console.log(productDetails?.productAttributes)}
              {productDetails?.productAttributes &&
                productDetails?.productAttributes.map((att, index) => {
                  return (
                    <h5 className="product-data my-2">
                      {att?.attribute?.name} : {att?.attribute?.tag?.name}{" "}
                    </h5>
                  );
                })}
              <h5 className="product-data my-2">
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
              className="d-flex justify-content-center justify-content-md-end align-items-start mt-5 mt-xl-2"
            >
              <button
                type="button"
                onClick={() =>
                  history("/update-product", {
                    state: { productId: productDetails.id },
                  })
                }
                className="btn btn-primary w-sm me-4"
              >
                Update Product
              </button>
            </Col>

            <Col sm={12} md={12} lg={12} xl={12}>
              <h5 className="product-data fw-semibold text-center text-md-start  mt-5">
                Product Size Variants :{" "}
              </h5>

              {productDetails?.sizeVariants && (
                <Row className="ms-2">
                  <Row>
                    <Col sm={3} md={3} lg={2} xl={1} xxl={1} className="border">
                      <h5 className="product-data my-2 ">Size</h5>
                    </Col>
                    <Col sm={5} md={5} lg={4} xl={3} xxl={3} className="border">
                      <h5 className="product-data my-2 text-center">
                        Available Quantity
                      </h5>
                    </Col>
                    <Col sm={4} md={4} lg={3} xl={2} xxl={2} className="border">
                      <h5 className="product-data my-2 text-center">Price</h5>
                    </Col>
                  </Row>{" "}
                  {productDetails?.sizeVariants.map((size, index) => {
                    return (
                      <Row>
                        <Col
                          sm={3}
                          md={3}
                          lg={2}
                          xl={1}
                          xxl={1}
                          className="border  px-2"
                        >
                          <h5 className="product-data my-2">
                            {size?.attribute?.tag?.name}
                          </h5>
                        </Col>
                        <Col
                          sm={5}
                          md={5}
                          lg={4}
                          xl={3}
                          xxl={3}
                          className="border "
                        >
                          <h5 className="product-data my-2 text-center">
                            {size?.availableQty}
                          </h5>
                        </Col>
                        <Col
                          sm={4}
                          md={4}
                          lg={3}
                          xl={2}
                          xxl={2}
                          className="border"
                        >
                          <h5 className="product-data my-2 text-end">
                            LKR {parseFloat(size?.sellingPrice).toFixed(2)}
                          </h5>
                        </Col>
                      </Row>
                    );
                  })}
                </Row>
              )}
            </Col>

            <Col sm={12} md={12} lg={12} xl={12}>
              <h5 className="product-data fw-semibold text-center text-md-start  my-4">
                Manufacture Details :{" "}
              </h5>
              <h5 className="product-data text-center text-md-start ">
                {parse(
                  productDetails?.product?.manufactureDetails
                    ? productDetails?.product?.manufactureDetails
                    : ""
                )}
              </h5>
            </Col>

            <Col sm={12} md={12} lg={12} xl={12}>
              <h5 className="product-data fw-semibold text-center text-md-start my-4">
                Product Variant Description :{" "}
              </h5>
              <h5 className="product-data text-center text-md-start">
                {parse(
                  productDetails?.description ? productDetails?.description : ""
                )}
              </h5>
            </Col>
          </Row>
          <Divider className="my-4" />
          <Row className="px-4 mb-4">
            {productDetails?.product?.productBaseVariant && (
              <h5 className="product-data fw-semibold text-center text-md-start my-4">
                Other Variants :{" "}
              </h5>
            )}

            <Row className="mx-2 mb-3">
              {productDetails?.product?.productBaseVariant &&
                productDetails?.product?.productBaseVariant.map(
                  (product, index) => (
                    <ProductCard
                      reload={async () => {
                        setIsRefresh(true);
                      }}
                      productData={product}
                    />
                  )
                )}
            </Row>
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
                  // current={currentPage}
                  // onChange={onChangePagination}
                  // total={totalRecodes}
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
