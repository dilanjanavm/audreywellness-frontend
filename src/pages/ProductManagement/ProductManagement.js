import React, { useEffect, useState } from "react";
import { Plus } from "react-feather";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import ProductCard from "../../Components/Common/cards/ProductCard";
// import { getAllProducts } from "../../service/productService";
import * as productVariantService from "../../service/productVariantService";

import { handleError } from "../../common/commonFunctions";

const ProductManagement = () => {
  document.title = "Product | Address Shop";

  const history = useNavigate();

  const [productList, setProductList] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    loadAllProducts();
  }, [isRefresh]);

  const loadAllProducts = async () => {
    setProductList([]);
    let temp = [];
    await productVariantService
      .getAllProductVariants()
      .then((res) => {
        console.log(res);
        res?.data.map((productVarition, index) => {
          temp.push({
            id: productVarition?.id,
            name: productVarition?.name,
            category: productVarition?.category,
            productImage: productVarition?.file,
            status: productVarition?.status,
            priceRange: productVarition?.priceRange,
            productId: productVarition?.productId,
          });
        });
        setProductList(temp);
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
      });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Product Management</h4>
        </div>
        <Card>
          <Row className="d-flex mt-4 mb-2 mx-1 justify-content-end">
            <Col
              sm={12}
              md={3}
              lg={3}
              xl={3}
              className="d-flex justify-content-end"
            >
              <Button
                color="primary"
                onClick={() => {
                  history("/create-product");
                }}
              >
                <Plus size={24} /> Add New Product
              </Button>
            </Col>
          </Row>
          <Row className="mx-2">
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="productName">Search by Product Name</Label>
                <Input
                  id="productName"
                  name="name"
                  placeholder="Search by product name"
                  type="text"
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="email">Search by Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Search by email"
                  type="text"
                  //   value={searchEmail}
                  //   onChange={handleSearchEmailChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className="mx-2 mb-3">
            {productList.map((product, index) => (
              <ProductCard
                reload={async () => {
                  setIsRefresh(true);
                }}
                productData={product}
              />
            ))}
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default ProductManagement;
