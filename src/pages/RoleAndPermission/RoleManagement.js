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
} from "../../common/commonFunctions";
import { Table } from "antd";
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
  //   const [selectedStatus, setSelectedStatus] = useState([]);
  //   const [statusList, setStatusList] = useState([]);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllRoles();
    // setStatusList([
    //   { value: 1, label: "Active" },
    //   { value: 2, label: "Inactive" },
    // ]);
  }, []);

  const toggleAddRoleModal = () => {
    setIsAddRoleModal(!isAddRoleModal);
    loadAllRoles();
  };

  const openUpdateRoleModal = (selectRole) => {
    setSelectedRole(selectRole);
    setIsUpdateRoleModal(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateRoleModal(false);
    loadAllRoles();
  };

  const loadAllRoles = async () => {
    popUploader(dispatch, true);
    roleAndPermissionService
      .getAllRoles()
      .then((res) => {
        console.log(res);
        popUploader(dispatch, false);

        let temp = [];
        const sortedRoles = res?.data.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          if (a.status === 2 && b.status !== 2) return 1;
          if (a.status !== 2 && b.status === 2) return -1;
          return 0;
        });

        sortedRoles.map((role, index) => {
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
                  onClick={(e) => handleDeleteRole(role?.id)}
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
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      })
      .finally();
  };

  const handleSearchRoleName = (e) => {
    const value = e.target.value;
    setRoleName(value); // Update the state with the input value
    if (value === "") {
      loadAllRoles(); // Load all roles if the search input is empty
    } else {
      // Filter the role list based on the input value
      const filteredRoles = roleList.filter((role) =>
        role.name.toLowerCase().includes(value.toLowerCase())
      );
      setRoleList(filteredRoles); // Update the role list state with filtered roles
    }
  };

  // const debounceSearchRoleFiltration = React.useCallback(
  //   // debounce(searchRoleFiltration, 400),
  //   []
  // );

  const handleDeleteRole = (roleId) => {
    // customToastMsg("Are you sure to delete this role ?", 0, () => {
    //   popUploader(dispatch, true);
    //   roleAndPermissionService
    //     .deleteRole(roleId)
    //     .then(async (res) => {
    //       await loadAllRoles();
    //       popUploader(dispatch, false);
    //       customToastMsg("Role deleted successfully", 1);
    //     })
    //     .catch(async (err) => {
    //       await loadAllRoles();
    //       handleError(err);
    //       console.log(err);
    //       popUploader(dispatch, false);
    //     })
    //     .finally();
    // });
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
              onChange={handleSearchRoleName}
            />
          </FormGroup>
        </Col>
        {/* <Col sm={12} md={4} lg={3} xl={3}>
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
                  e?.value === undefined ? "" : e === null ? "" : e.value
                );
              }}
              options={statusList}
            />
          </FormGroup>
        </Col> */}
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
    </>
  );
};

export default RoleManagement;
