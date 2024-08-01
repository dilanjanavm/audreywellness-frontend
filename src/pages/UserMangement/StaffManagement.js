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
import Select from "react-select";
import { Pagination, Table, Tag } from "antd";
import { Plus } from "react-feather";
import { StaffTableColumns } from "../../common/tableColumns";
import StaffModel from "../../Components/Common/modal/StaffModal";
import * as staffService from "../../service/staffService";
import { useDispatch } from "react-redux";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { getAllRolesWithStatusToDropdown } from "../../service/rolePermissionService";
import debounce from "lodash/debounce";

const StaffManagement = () => {
  document.title = "Staff Management| Address Shop";

  const [staffTableList, setStaffTableList] = useState([]);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isUpdateStaffModalOpen, setIsUpdateStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [statusList, setStatusList] = useState([]);

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllStaff(currentPage);
    loadAllRoles();
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const loadAllRoles = () => {
    popUploader(dispatch, true);
    getAllRolesWithStatusToDropdown("")
      .then((res) => {
        popUploader(dispatch, false);
        let temp = [];
        res?.data.records.map((role) => {
          if (role?.name != "CUSTOMER" && role?.name != "SUPER_ADMIN") {
            temp.push({
              value: role?.id,
              label: role?.name,
            });
          }
        });
        setRoleList(temp);
        popUploader(dispatch, false);
      })
      .catch((error) => {
        console.log(error);
        popUploader(dispatch, false);
        handleError(error);
      });
  };

  const loadAllStaff = (currentPage) => {
    popUploader(dispatch, true);
    clearFiltrationFields();
    setStaffTableList([]);
    staffService
      .getAllStaff(currentPage)
      .then((res) => {
        const formattedData = res.data.records.map((record) => ({
          name: record.user.firstName + " " + record.user.lastName,
          email: record.user.email,
          status: record.user.status,
          contactNo: record.user.staff?.contactNo
            ? record.user.staff?.contactNo
            : "empty",
          role: record.user?.role,
          roleName: record.user.role.name,
          file: record.user?.file,
          action: (
            <>
              <Button
                color="warning"
                className="m-2"
                outline
                onClick={(e) => {
                  toggleModal(record);
                }}
              >
                <span>Update</span>
              </Button>
              <Button
                color="danger"
                className="m-2"
                outline
                onClick={() => deleteStaff(record.id)}
              >
                <span>Remove</span>
              </Button>
            </>
          ),
        }));
        setStaffTableList(formattedData);
        setTotalRecodes(res?.data?.totalCount);
        setCurrentPage(res?.data?.currentPage);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const searchStaffFiltration = (name, email, role, status, currentPage) => {
    popUploader(dispatch, true);
    let temp = [];
    if (name === "" && email === "" && role === "" && status === "") {
      loadAllStaff(currentPage);
    } else {
      setStaffTableList([]);
      popUploader(dispatch, true);

      let data = {
        name: name,
        email: email,
        role: role,
        status: status,
      };

      staffService
        .staffFiltration(data, currentPage)
        .then((res) => {
          const formattedData = res.data.records.map((record) => ({
            name: record.user.firstName + " " + record.user.lastName,
            email: record.user.email,
            status: record.user.status,
            contactNo: record.user.staff?.contactNo
              ? record.user.staff?.contactNo
              : "empty",
            role: record.user?.role,
            roleName: record.user.role.name,
            file: record.user?.file,
            action: (
              <>
                <Button
                  color="warning"
                  className="m-2"
                  outline
                  onClick={(e) => {
                    toggleModal(record);
                  }}
                >
                  <span>Update</span>
                </Button>
                <Button
                  color="danger"
                  className="m-2"
                  outline
                  onClick={() => deleteStaff(record.id)}
                >
                  <span>Remove</span>
                </Button>
              </>
            ),
          }));
          setStaffTableList(formattedData);
          setTotalRecodes(res?.data?.totalCount);
          setCurrentPage(res?.data?.currentPage);
          popUploader(dispatch, false);
        })
        .catch((c) => {
          popUploader(dispatch, false);
          handleError(c);
        });
    }
  };

  const debounceSearchStaffFiltration = React.useCallback(
    debounce(searchStaffFiltration, 400),
    []
  );

  const deleteStaff = async (staffId) => {
    console.log(staffId);
    customSweetAlert("Are you sure to delete this staff ?", 0, () => {
      popUploader(dispatch, true);
      staffService
        .deleteStaff(staffId)
        .then((res) => {
          console.log(res);
          loadAllStaff(currentPage);
          popUploader(dispatch, false);
          customToastMsg("Staff has been  deleted", 1);
        })
        .catch((err) => {
          handleError(err);
          console.log(err);
          popUploader(dispatch, false);
        })
        .finally();
    });
  };

  const toggleModal = (val) => {
    console.log(val, "00000000000");
    if (val !== undefined) {
      setIsAddStaffModalOpen(true);
      setIsUpdateStaffModalOpen(true);
      setSelectedStaff(val);
      loadAllStaff(currentPage);
    } else {
      setIsAddStaffModalOpen(true);
      loadAllStaff(currentPage);
    }
  };

  const closeStaffModal = () => {
    setIsAddStaffModalOpen(false);
    setIsUpdateStaffModalOpen(false);
    setSelectedStaff([]);
    loadAllStaff(currentPage);
  };

  const clearFiltrationFields = () => {
    setSearchName("");
    setSearchEmail("");
    setSelectedRole("");
    setSelectedStatus([]);
  };

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (
      searchName === "" &&
      searchEmail === "" &&
      selectedRole === "" &&
      selectedStatus === ""
    ) {
      loadAllStaff(page);
    } else {
      debounceSearchStaffFiltration(
        searchName,
        searchEmail,
        selectedRole,
        selectedStatus,
        page
      );
    }
  };

  return (
    <div className="page-content">
      <StaffModel
        isUpdate={isUpdateStaffModalOpen}
        updateValue={selectedStaff}
        isOpen={isAddStaffModalOpen}
        toggle={(e) => {
          loadAllStaff(currentPage);
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
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="username">Search By Name</Label>
                <Input
                  id="username"
                  name="name"
                  placeholder="Search by name"
                  type="text"
                  value={searchName}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    debounceSearchStaffFiltration(
                      e.target.value,
                      searchEmail,
                      selectedRole,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="email">Search By Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Search by email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    debounceSearchStaffFiltration(
                      searchName,
                      e.target.value,
                      selectedRole,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label>Search By Role</Label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  value={
                    roleList.find((option) => option.value === selectedRole) ||
                    null
                  }
                  isClearable
                  onChange={(e) => {
                    setSelectedRole(
                      e?.value === undefined ? "" : e === null ? "" : e.value
                    );
                    debounceSearchStaffFiltration(
                      searchName,
                      searchEmail,
                      e?.value === undefined ? "" : e === null ? "" : e.value,
                      selectedStatus,
                      1
                    );
                  }}
                  options={roleList}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="exampleEmail">Search By Status</Label>
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
                    debounceSearchStaffFiltration(
                      searchName,
                      searchEmail,
                      selectedRole,
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
                columns={StaffTableColumns}
                dataSource={staffTableList}
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

export default StaffManagement;
