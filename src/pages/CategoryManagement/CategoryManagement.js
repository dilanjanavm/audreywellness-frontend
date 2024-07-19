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
import { Table, Tag } from "antd";
import { Plus } from "react-feather";
import { CategoryTableColumns } from "../../common/tableColumns";
import AddCategoryModel from "../../Components/Common/modal/AddCategoriesModal";
import * as categoryService from "../../service/categoryService";
import { useDispatch } from "react-redux";
import Select from "react-select";
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
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCategories();
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const loadAllCategories = () => {
    popUploader(dispatch, true);
    categoryService
      .getAllCategories()
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
        popUploader(dispatch, false);
      })
      .catch((err) => {
        console.log(err);
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const deleteCategory = async (catId) => {
    console.log(catId);
    customSweetAlert("Are you sure to delete this staff ?", 0, () => {
      popUploader(dispatch, true);
      categoryService
        .deleteCategory(catId)
        .then(async (res) => {
          console.log(res);
          await loadAllCategories();
          popUploader(dispatch, false);
          customToastMsg("Category has been  deleted", 1);
        })
        .catch(async (err) => {
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

  const closeStaffModal = () => {
    setIsUpdateCategoryModalOpen(false);
    setSelectedCategory("");
  };

  return (
    <div className="page-content">
      <AddCategoryModel
        isOpen={isAddCategoryModalOpen}
        toggle={(e) => {
          toggleAddCategoryModal();
          loadAllCategories();
        }}
      />
      <UpdateCategory
        currentData={selectedCategory}
        isOpen={isUpdateCategoryModalOpen}
        toggle={(e) => {
          closeStaffModal();
          loadAllCategories();
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
            <Col sm={12} md={6} lg={4} xl={4}>
              <FormGroup>
                <Label for="email">Search by Name</Label>
                <Input
                  id="email"
                  name="name"
                  placeholder="Search by name"
                  type="text"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={6} lg={4} xl={4}>
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
        </Card>
      </Container>
    </div>
  );
};

export default CategoryManagement;
