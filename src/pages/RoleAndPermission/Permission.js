import React, { useEffect, useState } from "react";
import { Row, Col, Button, Label, FormGroup } from "reactstrap";
import Select from "react-select";
import { Check } from "react-feather";
import * as roleAndPermissionService from "../../service/rolePermissionService";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import { Tree } from "antd";
import { useDispatch } from "react-redux";
import "../../assets/scss/custom/Permission.scss";

const Permission = () => {
  document.title = "Permission | Address Shop";

  const [selectedRole, setSelectedRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [permissionTreeData, setPermissionTreeData] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    loadAllRoles();
  }, []);

  useEffect(() => {
    if (selectedRole.id) {
      searchPermissionsByRole(selectedRole.id);
    }
  }, [selectedRole]);

  const handleChangeRoleSelection = (e) => {
    const selectRole = e?.value ? { id: e.value, name: e.label } : "";
    setSelectedRole(selectRole);
    if (selectRole.id) {
      searchPermissionsByRole(selectRole.id);
    } else {
      setPermissionTreeData([]);
      setCheckedKeys([]);
    }
  };

  const loadAllRoles = async () => {
    popUploader(dispatch, true);

    const status = 1;
    try {
      const res = await roleAndPermissionService.getAllRoles(status);
      popUploader(dispatch, false);

      const temp = res?.data.map((role) => ({
        value: role?.id,
        label: role?.name,
      }));
      setRoleList(temp);

      // Find the SUPER_ADMIN role
      const superAdminRole = res.data.find((role) => role.name === "ADMIN");
      if (superAdminRole) {
        setSelectedRole({ id: superAdminRole.id, name: superAdminRole.name });
        searchPermissionsByRole(superAdminRole.id);
      }
    } catch (error) {
      console.log(error);
      popUploader(dispatch, false);

      handleError(error);
    }
  };

  const searchPermissionsByRole = async (roleId) => {
    popUploader(dispatch, true);

    const withPermissions = true;
    try {
      const res =
        await roleAndPermissionService.getRoleByIdWithOrWithoutPermission(
          roleId,
          withPermissions
        );
      popUploader(dispatch, false);

      const transformedData = transformToTreeData(res.data);
      const checked = extractCheckedKeys(res.data);
      setPermissionTreeData(transformedData);
      setCheckedKeys(checked);
    } catch (error) {
      popUploader(dispatch, false);
      console.log(error);
    }
  };

  const assignPermissionToRole = async () => {
    if (!selectedRole.id) {
      return;
    }
    customSweetAlert("Are you sure to update permissions ?", 0, async () => {
      const data = {
        roleId: selectedRole.id,
        permissionIds: checkedKeys,
      };

      try {
        popUploader(dispatch, true);

        await roleAndPermissionService
          .assignRolePermission(data)
          .then(async (res) => {
            popUploader(dispatch, false);
            customToastMsg("Permissions are successfully updated ", 1);
            await searchPermissionsByRole(res.data.roleId);
          })
          .catch((err) => {
            console.log(err);
            handleError(err);
          });
      } catch (err) {
        handleError(err);
        console.log(err);
      }
    });
  };

  const transformToTreeData = (data) => {
    return data.map((item) => ({
      title: item.description ? `${item.description}` : item.code,
      key: item.id,
      children: item.children ? transformToTreeData(item.children) : [],
    }));
  };

  const extractCheckedKeys = (data) => {
    let keys = [];
    data.forEach((item) => {
      if (item.hasPermission) {
        keys.push(item.id);
      }
      if (item.children && item.children.length > 0) {
        keys = keys.concat(extractCheckedKeys(item.children));
      }
    });
    return keys;
  };

  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys);
  };

  return (
    <>
      <div className="row mt-3 mx-2">
        <h4>Permission Management</h4>
      </div>
      <Row className="mt-4">
        <Col sm={4} md={4} lg={4} xl={4}>
          <FormGroup className="ms-3">
            <Label>Select Role</Label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable
              isClearable
              value={
                roleList.find((option) => option.value === selectedRole.id) ||
                null
              }
              onChange={handleChangeRoleSelection}
              options={roleList}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className={"custom-tree"} style={{ margin: "20px 0" }}>
            <Tree
              checkable
              checkedKeys={checkedKeys}
              onCheck={onCheck}
              treeData={permissionTreeData}
            />
          </div>
        </Col>
      </Row>
      <Row className="d-flex mt-2 mb-3 mx-1 justify-content-end">
        <Col sm={12} md={3} lg={3} xl={2}>
          <Button
            color="primary"
            className="w-auto"
            onClick={assignPermissionToRole}
          >
            <Check size={20} /> Save
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Permission;
