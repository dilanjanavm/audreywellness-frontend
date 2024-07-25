import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Label,
  FormGroup,
  Input,
} from "reactstrap";
import { Plus } from "react-feather";
import AddRoleModal from "../../Components/Common/modal/AddRoleModel";
import UpdateRoleModal from "../../Components/Common/modal/UpdateRoleModel";
import {
  handleError,
  customToastMsg,
  popUploader,
  customSweetAlert,
} from "../../common/commonFunctions";
import Select from "react-select";
import { Pagination, Table } from "antd";
import { RoleTableColumns } from "../../common/tableColumns";
import debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import * as roleAndPermissionService from "../../service/rolePermissionService";

const RoleManagement = () => {
  document.title = "Role | Address Shop";

  const [isAddRoleModal, setIsAddRoleModal] = useState(false);
  const [isUpdateRoleModal, setIsUpdateRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [statusList, setStatusList] = useState([]);

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllRoles(currentPage);
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const toggleAddRoleModal = () => {
    setIsAddRoleModal(!isAddRoleModal);
    loadAllRoles(currentPage);
  };

  const openUpdateRoleModal = (selectRole) => {
    setSelectedRole(selectRole);
    setIsUpdateRoleModal(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateRoleModal(false);
    loadAllRoles(currentPage);
  };

  const loadAllRoles = async (currentPage) => {
    setRoleList([]);
    popUploader(dispatch, true);
    roleAndPermissionService
      .getAllRoles(currentPage)
      .then((res) => {
        console.log(res);
        popUploader(dispatch, false);

        let temp = [];

        res?.data.map((role, index) => {
          temp.push({
            id: role?.id,
            name: role?.name,
            role_status: role?.status,
            isDefault: role?.isDefault,
            action: (
              <>
                <Button
                  color="warning"
                  className="m-2"
                  onClick={(e) => openUpdateRoleModal(role)}
                  disabled={role?.isDefault}
                  style={{
                    opacity: role?.isDefault ? 0.5 : 1,
                    cursor: role?.isDefault ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Update</span>
                </Button>
                <Button
                  color="danger"
                  className="m-2"
                  onClick={(e) => handleDeleteRole(role)}
                  disabled={role?.isDefault}
                  style={{
                    opacity: role?.isDefault ? 0.5 : 1,
                    cursor: role?.isDefault ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Delete</span>
                </Button>
              </>
            ),
          });
        });
        setRoleList(temp);
        setTotalRecodes(res?.data?.totalCount);
        setCurrentPage(res?.data?.currentPage);
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      });
  };

  const searchRoleFiltration = (name, status, currentPage) => {
    popUploader(dispatch, true);
    let temp = [];
    if (name === "" && status === "") {
      loadAllRoles(currentPage);
    } else {
      setRoleList([]);
      popUploader(dispatch, true);

      let data = {
        name: name,
        status: status,
      };

      roleAndPermissionService
        .rolesFiltration(data, currentPage)
        .then((res) => {
          console.log(res);
          popUploader(dispatch, false);

          let temp = [];

          res?.data.map((role, index) => {
            temp.push({
              id: role?.id,
              name: role?.name,
              role_status: role?.status,
              isDefault: role?.isDefault,
              action: (
                <>
                  <Button
                    color="warning"
                    className="m-2"
                    onClick={(e) => openUpdateRoleModal(role)}
                    disabled={role?.isDefault}
                    style={{
                      opacity: role?.isDefault ? 0.5 : 1,
                      cursor: role?.isDefault ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>Update</span>
                  </Button>
                  <Button
                    color="danger"
                    className="m-2"
                    onClick={(e) => handleDeleteRole(role)}
                    disabled={role?.isDefault}
                    style={{
                      opacity: role?.isDefault ? 0.5 : 1,
                      cursor: role?.isDefault ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>Delete</span>
                  </Button>
                </>
              ),
            });
          });
          setRoleList(temp);
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

  const debounceSearchRoleFiltration = React.useCallback(
    debounce(searchRoleFiltration, 400),
    []
  );

  const handleDeleteRole = (role) => {
    console.log(role);
    customSweetAlert("Are you sure to delete this role ?", 0, () => {
      popUploader(dispatch, true);
      const data = {
        name: role?.name,
        status: 0,
      };

      roleAndPermissionService
        .deleteRole(role?.id, data)
        .then(async (res) => {
          await loadAllRoles(currentPage);
          popUploader(dispatch, false);
          customToastMsg("Role deleted successfully", 1);
        })
        .catch(async (err) => {
          await loadAllRoles(currentPage);
          handleError(err);
          console.log(err);
          popUploader(dispatch, false);
        })
        .finally();
    });
  };

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (roleName === "" && selectedStatus === "") {
      loadAllRoles(page);
    } else {
      debounceSearchRoleFiltration(roleName, selectedStatus, page);
    }
  };

  return (
    <>
      <AddRoleModal isOpen={isAddRoleModal} toggle={toggleAddRoleModal} />

      <UpdateRoleModal
        isOpen={isUpdateRoleModal}
        onClose={closeUpdateModal}
        currentData={selectedRole}
      />

      <div className="row mt-3 mx-2">
        <h4>Role Management</h4>
      </div>

      <Row className="d-flex mt-2 mb-2 mx-1 justify-content-end">
        <Col
          sm={12}
          md={3}
          lg={3}
          xl={3}
          className="d-flex justify-content-end"
        >
          <Button color="primary" className="w-80" onClick={toggleAddRoleModal}>
            <Plus size={19} /> Add New
          </Button>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={4} lg={3} xl={3}>
          <FormGroup className="ms-3">
            <Label for="exampleEmail">Search by Role Name</Label>
            <Input
              id="exampleEmail"
              name="email"
              value={roleName}
              placeholder="Search by role name"
              type="text"
              onChange={(e) => {
                setRoleName(e.target.value);
                debounceSearchRoleFiltration(e.target.value, selectedStatus, 1);
              }}
            />
          </FormGroup>
        </Col>
        <Col sm={12} md={4} lg={3} xl={3}>
          <FormGroup className="ms-3">
            <Label for="exampleEmail">Search by status</Label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable
              onChange={(e) => {
                setSelectedStatus(
                  e?.value === undefined ? "" : e === null ? "" : e.value
                );
                debounceSearchRoleFiltration(
                  roleName,
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
            columns={RoleTableColumns}
            dataSource={roleList}
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
    </>
  );
};

export default RoleManagement;
