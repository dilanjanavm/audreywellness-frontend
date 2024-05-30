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
// import StaffModel from "../../Components/Common/modal/StaffModal";
import AddCategoryModel from "../../Components/Common/modal/AddCategoriesModal";

import * as categoryService from "../../service/categoryService";
// import { hideLoader, showLoader } from "../../../slices/loader/loader";
import { useDispatch } from "react-redux";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
} from "../../common/commonFunctions";
const CategoryManagement = () => {
  document.title = "Staff Management| Address Shop";

  const [categoryTableList, setCategoryTableList] = useState([]);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isUpdateStaffModalOpen, setIsUpdateStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  let dispatch = useDispatch();
  useEffect(() => {
    loadAllCategories();
  }, []);

  const loadAllCategories = () => {
    // dispatch(showLoader(true));
    categoryService.getAllCategories().then((res) => {
      //     dispatch(hideLoader(true));
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
              className="mx-2"
              outline
              onClick={(e) => {
                toggleModal(record);
              }}
            >
              <span>Update</span>
            </Button>
            <Button
              color="danger"
              className=""
              outline
              onClick={() => deleteStaff(record.id)}
            >
              <span>Remove</span>
            </Button>
          </>
        ),
      }));
      console.log(formattedData, "formated data");
      setCategoryTableList(formattedData);
    });
    //   .catch((err) => {
    //     console.log(err);
    //     handleError(err);
    //   });
  };

  const deleteStaff = async (staffId) => {
    //     console.log(staffId);
    //     sweetAlertConformation("Are you sure to delete this staff ?", 0, () => {
    //       dispatch(showLoader(true));
    //       staffService
    //         .deleteStaff(staffId)
    //         .then(async (res) => {
    //           console.log(res);
    //           await loadAllCategories();
    //           dispatch(hideLoader(false));
    //           customToastMsg("Staff has been  deleted", 1);
    //         })
    //         .catch(async (err) => {
    //           await loadAllCategories();
    //           handleError(err);
    //           console.log(err);
    //           dispatch(hideLoader(false));
    //         })
    //         .finally();
    //     });
    //   };
    //   const handleSearchEmailChange = (e) => {
    //     const { value } = e.target; // Extract value from event target
    //     setSearchEmail(value);
    //     if (value === "") {
    //       // If search input is empty, load all staff records
    //       loadAllCategories();
    //     }
  };

  const toggleModal = (val) => {
    console.log(val, "00000000000");
    if (val !== undefined) {
      setIsAddStaffModalOpen(true);
      setIsUpdateStaffModalOpen(true);
      setSelectedStaff(val);
      loadAllCategories();
    } else {
      setIsAddStaffModalOpen(true);
      loadAllCategories();
    }
  };

  // useEffect(() => {
  //   const filteredStaff = categoryTableList.filter((staff) =>
  //     staff.email.toLowerCase().includes(searchEmail.toLowerCase())
  //   );
  //   setCategoryTableList(filteredStaff);
  // }, [searchEmail]);

  const closeStaffModal = () => {
    setIsAddStaffModalOpen(false);
    setIsUpdateStaffModalOpen(false);
    setSelectedStaff([]);
    loadAllCategories();
  };

  return (
    <div className="page-content">
      <AddCategoryModel
        isUpdate={isUpdateStaffModalOpen}
        updateValue={selectedStaff}
        isOpen={isAddStaffModalOpen}
        toggle={(e) => {
          loadAllCategories();
          closeStaffModal();
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
                  toggleModal();
                }}
              >
                <Plus size={24} /> Add New
              </Button>
            </Col>
          </Row>
          <Row className="mx-2">
            {/* <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="username">Search by Name</Label>
                <Input
                  id="username"
                  name="name"
                  placeholder="Search by name"
                  type="text"
                />
              </FormGroup>
            </Col> */}
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="email">Search by Name</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Search by name"
                  type="text"
                  //   value={searchEmail}
                  //   onChange={handleSearchEmailChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={true}
                columns={CategoryTableColumns}
                dataSource={categoryTableList}
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default CategoryManagement;
