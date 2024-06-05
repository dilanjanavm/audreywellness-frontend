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
import { StaffTableColumns } from "../../common/tableColumns";
import StaffModel from "../../Components/Common/modal/StaffModal";
import * as staffService from "../../service/staffService";
// import { hideLoader, showLoader } from "../../../slices/loader/loader";
import { useDispatch } from "react-redux";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
const StaffManagement = () => {
  document.title = "Staff Management| Address Shop";

  const [staffTableList, setStaffTableList] = useState([]);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isUpdateStaffModalOpen, setIsUpdateStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  let dispatch = useDispatch();
  useEffect(() => {
    loadAllStaffs();
  }, []);

  const loadAllStaffs = () => {
    popUploader(dispatch, true);

    staffService
      .getAll()
      .then((res) => {
        popUploader(dispatch, false);

        console.log(res, ":::::");
        const formattedData = res.data.map((record) => ({
          name: record.user.firstName + " " + record.user.lastName,
          email: record.user.email,
          status: record.user.status,
          contactNo: record.user.staff?.contactNo
            ? record.user.staff?.contactNo
            : "empty",
          role: record.user?.role,
          roleName: record.user.role.name,
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
        setStaffTableList(formattedData);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const deleteStaff = async (staffId) => {
    //     console.log(staffId);
    //     sweetAlertConformation("Are you sure to delete this staff ?", 0, () => {
    //       dispatch(showLoader(true));
    //       staffService
    //         .deleteStaff(staffId)
    //         .then(async (res) => {
    //           console.log(res);
    //           await loadAllStaffs();
    //           dispatch(hideLoader(false));
    //           customToastMsg("Staff has been  deleted", 1);
    //         })
    //         .catch(async (err) => {
    //           await loadAllStaffs();
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
    //       loadAllStaffs();
    //     }
  };

  const toggleModal = (val) => {
    console.log(val, "00000000000");
    if (val !== undefined) {
      setIsAddStaffModalOpen(true);
      setIsUpdateStaffModalOpen(true);
      setSelectedStaff(val);
      loadAllStaffs();
    } else {
      setIsAddStaffModalOpen(true);
      loadAllStaffs();
    }
  };

  // useEffect(() => {
  //   const filteredStaff = staffTableList.filter((staff) =>
  //     staff.email.toLowerCase().includes(searchEmail.toLowerCase())
  //   );
  //   setStaffTableList(filteredStaff);
  // }, [searchEmail]);

  const closeStaffModal = () => {
    setIsAddStaffModalOpen(false);
    setIsUpdateStaffModalOpen(false);
    setSelectedStaff([]);
    loadAllStaffs();
  };

  return (
    <div className="page-content">
      <StaffModel
        isUpdate={isUpdateStaffModalOpen}
        updateValue={selectedStaff}
        isOpen={isAddStaffModalOpen}
        toggle={(e) => {
          loadAllStaffs();
          closeStaffModal();
        }}
      />
      <Container fluid>
        <div className="row mt-3">
          <h4>Staff Management</h4>
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
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={true}
                columns={StaffTableColumns}
                dataSource={staffTableList}
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default StaffManagement;
