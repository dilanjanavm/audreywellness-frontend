import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Label,
  Input,
  FormGroup,
  Button,
} from "reactstrap";
import { Pagination, Table, Tag } from "antd";
import { Plus } from "react-feather";
import { CategoryTableColumns } from "../../common/tableColumns";
import AddCategoryModel from "../../Components/Common/modal/AddCategoriesModal";
import * as categoryService from "../../service/categoryService";
import { useDispatch } from "react-redux";
import Select from "react-select";
import debounce from "lodash.debounce";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import UpdateCategory from "../../Components/Common/modal/UpdateCategoryModal";
const CategoryManagement = () => {
  document.title = "Staff Management| Address Shop";

  const [categoryTableList, setCategoryTableList] = useState([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isUpdateCategoryModalOpen, setIsUpdateCategoryModalOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchCategoryName, setSearchCategoryName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCategories(currentPage);
    getAllCategoriesWithOrWithoutSubCat();
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const getAllCategoriesWithOrWithoutSubCat = () => {
    setCategoryList([]);
    popUploader(dispatch, true);
    categoryService
      .getAllCategoriesWithOrWithoutSubCategories(false)
      .then((res) => {
        console.log(res.data);
        let temp = [];
        res.data.map((cat, index) => {
          temp.push({ value: cat?.id, label: cat?.name });
        });

        setCategoryList(temp);
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      });
  };

  const loadAllCategories = (currentPage) => {
    popUploader(dispatch, true);
    categoryService
      .getAllCategories(currentPage)
      .then((res) => {
        const formattedData = res.data.map((record) => ({
          name: record.name,
          hierarchy: record.hierarchy,
          status: record.status,
          file: (
            <div>
              {record?.file ? (
                <img
                  className="w-100 h-100 object-fit-cover"
                  src={record?.file?.originalPath}
                  alt="categoryImg"
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
          ),
          action: (
            <>
              <Button
                color="warning"
                className="m-2"
                outline
                onClick={(e) => {
                  toggleUpdateCategoryModal(record);
                }}
              >
                <span>Update</span>
              </Button>
              <Button
                color="danger"
                className="m-2"
                outline
                onClick={() => deleteCategory(record.id)}
              >
                <span>Remove</span>
              </Button>
            </>
          ),
        }));
        setCategoryTableList(formattedData);
        setCurrentPage(res?.data?.currentPage);
        setTotalRecodes(res?.data?.totalRecords);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        console.log(err);
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const deleteCategory = (catId) => {
    console.log(catId);
    customSweetAlert("Are you sure to delete this category ?", 0, () => {
      popUploader(dispatch, true);
      categoryService
        .deleteCategory(catId)
        .then((res) => {
          console.log(res);
          loadAllCategories(currentPage);
          popUploader(dispatch, false);
          customToastMsg("Category has been  deleted", 1);
        })
        .catch((err) => {
          handleError(err);
          console.log(err);
          popUploader(dispatch, false);
        });
    });
  };

  const toggleAddCategoryModal = () => {
    setIsAddCategoryModalOpen(!isAddCategoryModalOpen);
  };

  const toggleUpdateCategoryModal = (category) => {
    setIsUpdateCategoryModalOpen(true);
    setSelectedCategory(category);
  };

  const closeCategoryModal = () => {
    setIsUpdateCategoryModalOpen(false);
    setSelectedCategory("");
  };

  const searchCategoryFiltration = (name, categoryId, status, currentPage) => {
    popUploader(dispatch, true);
    let temp = [];
    if (name === "" && categoryId === "" && status === "") {
      loadAllCategories(currentPage);
    } else {
      popUploader(dispatch, true);
      const data = {
        name: name,
        categoryId: categoryId,
        status: status,
      };
      categoryService
        .categoryFiltration(data, currentPage)
        .then((res) => {
          const formattedData = res.data.map((record) => ({
            name: record.name,
            hierarchy: record.hierarchy,
            status: record.status,
            file: (
              <div>
                {record?.file ? (
                  <img
                    className="w-100 h-100 object-fit-cover"
                    src={record?.file?.originalPath}
                    alt="categoryImg"
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
            ),
            action: (
              <>
                <Button
                  color="warning"
                  className="m-2"
                  outline
                  onClick={(e) => {
                    toggleUpdateCategoryModal(record);
                  }}
                >
                  <span>Update</span>
                </Button>
                <Button
                  color="danger"
                  className="m-2"
                  outline
                  onClick={() => deleteCategory(record.id)}
                >
                  <span>Remove</span>
                </Button>
              </>
            ),
          }));
          setCategoryTableList(formattedData);
          setCurrentPage(res?.data?.currentPage);
          setTotalRecodes(res?.data?.totalRecords);
          popUploader(dispatch, false);
        })
        .catch((err) => {
          console.log(err);
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  const debounceSearchCategoryFiltration = React.useCallback(
    debounce(searchCategoryFiltration, 500),
    []
  );

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (searchCategoryName === "" && selectedStatus === "") {
      loadAllCategories(page);
    } else {
      debounceSearchCategoryFiltration(
        searchCategoryName,
        selectedStatus,
        page
      );
    }
  };

  return (
    <div className="page-content">
      <AddCategoryModel
        isOpen={isAddCategoryModalOpen}
        toggle={(e) => {
          toggleAddCategoryModal();
          loadAllCategories(currentPage);
        }}
      />
      <UpdateCategory
        currentData={selectedCategory}
        isOpen={isUpdateCategoryModalOpen}
        toggle={(e) => {
          closeCategoryModal();
          loadAllCategories(currentPage);
        }}
      />
      <Container fluid>
        <div className="row mt-3">
          <h4>Category Management</h4>
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
                className="mb-2"
                color="primary"
                onClick={() => {
                  toggleAddCategoryModal();
                }}
              >
                <Plus size={24} /> Add New Category
              </Button>
            </Col>
          </Row>
          <Row className="mx-2">
            <Col sm={12} md={4} lg={4} xl={4}>
              <FormGroup>
                <Label for="name">Search by Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Search by name"
                  type="text"
                  value={searchCategoryName}
                  onChange={(e) => {
                    setSearchCategoryName(e.target.value);
                    debounceSearchCategoryFiltration(
                      e.target.value,
                      selectedCategoryId,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={4} xl={4}>
              <FormGroup>
                <Label for="categoryName">Select Main Category </Label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable
                  value={
                    categoryList.find(
                      (option) => option.value === selectedCategoryId
                    ) || null
                  }
                  onChange={(e) => {
                    setSelectedCategoryId(
                      e?.value === undefined ? "" : e.value
                    );
                    debounceSearchCategoryFiltration(
                      searchCategoryName,
                      e?.value === undefined ? "" : e === null ? "" : e.value,
                      selectedStatus,
                      1
                    );
                  }}
                  options={categoryList}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={4} xl={4}>
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
                    debounceSearchCategoryFiltration(
                      searchCategoryName,
                      selectedCategoryId,
                      e?.value === undefined ? "" : e === null ? "" : e.value,
                      1
                    );
                  }}
                  options={statusList}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={false}
                columns={CategoryTableColumns}
                dataSource={categoryTableList}
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
                showTotal={(total) => `Total ${total} items`}
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default CategoryManagement;
