import React, { useEffect, useState } from "react";
import { Plus } from "react-feather";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
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
import debounce from "lodash/debounce";
import ProductCard from "../../Components/Common/cards/ProductCard";
import * as productBaseVariantService from "../../service/productBaseVariationService";
import {
  customSweetAlert,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { useDispatch } from "react-redux";
import { getAllCategoriesWithOrWithoutSubCategories } from "../../service/categoryService";
import { Cascader, Pagination, Slider } from "antd";

const ProductManagement = () => {
  document.title = "Product | Address Shop";

  const history = useNavigate();

  const [productList, setProductList] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [searchProductName, setSearchProductName] = useState("");
  const [range, setRange] = useState([0, 0]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    loadAllProducts(currentPage);
    loadAllCategories();
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  useEffect(() => {
    if (isRefresh) {
      loadAllProducts(currentPage);
      setIsRefresh(false);
    }
  }, [isRefresh]);

  const loadAllCategories = () => {
    setCategoryList([]);
    popUploader(dispatch, true);
    getAllCategoriesWithOrWithoutSubCategories(true)
      .then((res) => {
        const temp = res.data.map((cat) => {
          return {
            value: cat.id,
            label: cat.name,
            children: cat.children.map((child) => ({
              value: child.id,
              label: child.name,
            })),
          };
        });

        setCategoryList(temp);
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      });
  };

  const displayRender = (labels) => labels[labels.length - 1];

  const loadAllProducts = (currentPage) => {
    popUploader(dispatch, true);
    clearFiltrationFields();
    setProductList([]);
    let temp = [];
    productBaseVariantService
      .getAllProductBaseVariation(currentPage)
      .then((res) => {
        res?.data.map((productVarition, index) => {
          temp.push({
            id: productVarition?.id,
            name: productVarition?.name,
            category: productVarition?.category,
            file: productVarition?.file,
            status: productVarition?.status,
            priceRange: JSON.stringify(productVarition?.priceRange?.range),
            productId: productVarition?.productId,
          });
        });

        setProductList(temp);
        setCurrentPage(res?.data?.currentPage);
        setTotalRecodes(res?.data?.totalCount);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const handleChangePrice = (value) => {
    const sanitizedValue = value.map((v) => (isNaN(v) ? 0 : v));
    setRange(sanitizedValue);
    setMinPrice(sanitizedValue[0]);
    setMaxPrice(sanitizedValue[1]);
    debounceHandleSearchProductFiltration(
      sanitizedValue,
      searchProductName,
      selectedCategory,
      selectedStatus,
      1
    );
  };

  const handleSearchProductFiltration = (
    range,
    productName,
    categoryId,
    status,
    currentPage
  ) => {
    let max = "";
    let min = "";

    if (range[0] === 0 && range[1] === 0) {
      max = "";
      min = "";
    } else {
      min = range[0];
      max = range[1];
    }

    if (
      productName === "" &&
      max === "" &&
      min === "" &&
      categoryId === "" &&
      status === ""
    ) {
      loadAllProducts(currentPage);
    } else {
      popUploader(dispatch, true);
      setProductList([]);

      let temp = [];

      let data = {
        name: productName,
        maxPrice: max,
        minPrice: min,
        categoryId:
          categoryId === undefined ? "" : categoryId === null ? "" : categoryId,
        status: status === undefined ? "" : status === null ? "" : status,
      };

      productBaseVariantService
        .productBaseVariationFiltration(data, currentPage)
        .then((res) => {
          res?.data.map((productVarition, index) => {
            temp.push({
              id: productVarition?.id,
              name: productVarition?.name,
              category: productVarition?.category,
              file: productVarition?.file,
              status: productVarition?.status,
              priceRange: JSON.stringify(productVarition?.priceRange?.range),
              productId: productVarition?.productId,
            });
          });

          setProductList(temp);
          setCurrentPage(res?.data?.currentPage);
          setTotalRecodes(res?.data?.totalCount);
          popUploader(dispatch, false);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  const debounceHandleSearchProductFiltration = React.useCallback(
    debounce(handleSearchProductFiltration, 500),
    []
  );

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (
      searchProductName === "" &&
      range[0] === 0 &&
      range[1] === 0 &&
      selectedCategory === "" &&
      selectedStatus === ""
    ) {
      loadAllProducts(page);
    } else {
      debounceHandleSearchProductFiltration(
        range,
        searchProductName,
        selectedCategory,
        selectedStatus,
        page
      );
    }
  };

  const clearFiltrationFields = () => {
    setRange([0, 0]);
    setMinPrice(0);
    setMaxPrice(0);
    setSearchProductName("");
    setSelectedStatus("");
    setSelectedCategory("");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Product Management</h4>
        </div>
        <Card>
          <Row className="d-flex my-4 mx-1 justify-content-between  flex-column-reverse flex-xl-row flex-lg-row flex-md-row">
            <Col sm={12} md={9} lg={7} xl={6}>
              <FormGroup className="ms-3">
                <Label for="exampleEmail">
                  Search by Sub Product Selling Price
                </Label>
                <Row>
                  <Col sm={12} md={8} lg={8} xl={8}>
                    <Slider
                      range
                      min={0}
                      max={10000}
                      value={range}
                      onChange={handleChangePrice}
                    />
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={4}>
                    <Row className="align-items-center justify-content-center">
                      <Input
                        style={{ width: "40%" }}
                        value={minPrice}
                        type="number"
                        onChange={(e) => {
                          setMinPrice(parseFloat(e.target.value));
                          handleChangePrice([
                            parseFloat(e.target.value),
                            maxPrice,
                          ]);
                        }}
                      />
                      <Label
                        style={{
                          width: "min-content",
                          margin: 0,
                          padding: 6,
                        }}
                      >
                        -
                      </Label>
                      <Input
                        style={{ width: "40%" }}
                        value={maxPrice}
                        type="number"
                        onChange={(e) => {
                          setMaxPrice(parseFloat(e.target.value));
                          handleChangePrice([
                            minPrice,
                            parseFloat(e.target.value),
                          ]);
                        }}
                      />
                    </Row>
                  </Col>
                </Row>
              </FormGroup>
            </Col>
            <Col
              sm={12}
              md={3}
              lg={3}
              xl={3}
              className="d-flex justify-content-end align-items-center"
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
                  value={searchProductName}
                  onChange={(e) => {
                    setSearchProductName(e.target.value);
                    debounceHandleSearchProductFiltration(
                      range,
                      e.target.value,
                      selectedCategory,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={3} xl={3}>
              <FormGroup>
                <Label for="exampleEmail">Search by Category</Label>
                <Cascader
                  options={categoryList}
                  expandTrigger="hover"
                  displayRender={displayRender}
                  allowClear
                  placeholder="Select category"
                  style={{ height: 38, width: "100%" }}
                  searchValue="true"
                  onChange={(value) => {
                    const selectedCategory = value.length
                      ? value[value.length - 1]
                      : "";
                    setSelectedCategory(selectedCategory);
                    debounceHandleSearchProductFiltration(
                      range,
                      searchProductName,
                      selectedCategory,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={3} xl={3}>
              <FormGroup>
                <Label for="exampleEmail">Search by Status</Label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable
                  value={
                    statusList.find(
                      (option) => option.value === selectedStatus
                    ) || null
                  }
                  onChange={(e) => {
                    setSelectedStatus(
                      e?.value === undefined ? "" : e === null ? "" : e.value
                    );
                    debounceHandleSearchProductFiltration(
                      range,
                      searchProductName,
                      selectedCategory,
                      e?.value === undefined ? "" : e === null ? "" : e.value,
                      1
                    );
                  }}
                  options={statusList}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className="mx-2 mb-3">
            {productList.map((product, index) => (
              <ProductCard
                key={index}
                reload={async () => {
                  setIsRefresh(true);
                }}
                productData={product}
              />
            ))}
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
                showTotal={(total) => `Total ${total} items`}
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default ProductManagement;
