import React, { useEffect, useState } from "react";
import { Row, Col, Button, Label, FormGroup } from "reactstrap";
import Select from "react-select";
import { Check } from "react-feather";
import * as roleAndPermssionService from "../../service/roleAndPermissionService";
import {
  sweetAlertConformation,
  customToastMsg,
  handleError,
} from "../../common/commonFunctions";
import { Checkbox } from "antd";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../slices/loader/loader";

const Permission = () => {
  document.title = "Permission | Talk To Leader";

  const [selectedRole, setSelectedRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  const [rolePermissionList, setRolePermissionList] = useState([]);

  const CheckboxGroup = Checkbox.Group;
  const [searchCheckdPermissionList, setSearchCheckdPermissionList] = useState(
    []
  );
  const [checkedList, setCheckedList] = useState(searchCheckdPermissionList);
  const checkAll = permissionList.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < permissionList.length;

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllRoles();
    loadAllPermissions();
  }, []);

  useEffect(() => {
    setCheckedList(searchCheckdPermissionList);
  }, [searchCheckdPermissionList]);

  const onChange = (list) => {
    setCheckedList(list);
  };

  const onCheckAllChange = (e) => {
    setCheckedList(
      e.target.checked
        ? permissionList.map((permission) => permission.value)
        : []
    );
  };

  const handleChangeRoleSelection = (e) => {
    let selectRole = e?.value === undefined ? "" : e === null ? "" : e;
    setSelectedRole({ id: selectRole.value, name: selectRole.label });
    if (selectRole != "") {
      searchPermissionsByRole(selectRole?.value);
    } else {
      setSelectedRole("");
      setCheckedList([]);
    }
  };

  const loadAllRoles = async () => {
    dispatch(showLoader(true));
    await roleAndPermssionService
      .getAllRoles()
      .then((res) => {
        let temp = [];
        res?.records.map((role, index) => {
          temp.push({ value: role?.id, label: role?.name });
        });
        setRoleList(temp);
        dispatch(hideLoader(false));
      })
      .catch((c) => {
        dispatch(hideLoader(false));
        handleError(c);
      })
      .finally();
  };

  const loadAllPermissions = async () => {
    dispatch(showLoader(true));
    await roleAndPermssionService
      .getAllPermissions()
      .then((res) => {
        let temp = [];
        res?.records.map((per, index) => {
          temp.push({ value: per?.id, label: per?.name });
        });
        setPermissionList(temp);
        dispatch(hideLoader(false));
      })
      .catch((c) => {
        dispatch(hideLoader(false));
        handleError(c);
      })
      .finally();
  };

  const handleSavePermissionChangers = async () => {
    selectedRole === "" || selectedRole.id === "" || selectedRole === null
      ? customToastMsg("Please select a role", 2)
      : sweetAlertConformation(
          "Are you sure to save changers ?",
          2,
          async () => {
            const selectedPermissions = permissionList
              .filter((permission) => checkedList.includes(permission.value))
              .map(({ value, label }) => ({
                id: value,
                name: label,
              }));
            const data = {
              role: selectedRole,
              permission: selectedPermissions,
            };
            console.log(data, "data");
            dispatch(showLoader(true));
            await roleAndPermssionService
              .assignPermissionsToRole(data)
              .then((resp) => {
                customToastMsg("Permission assiggned successful", 1);
                setCheckedList([]);
                setSelectedRole({
                  id: "",
                  name: "",
                });
                dispatch(hideLoader(false));
              })
              .catch((err) => {
                dispatch(hideLoader(false));
                handleError(err);
              })
              .finally();
          }
        );
  };

  const searchPermissionsByRole = async (roleId) => {
    dispatch(showLoader(true));
    roleId === undefined
      ? loadAllPermissions()
      : await roleAndPermssionService
          .getAllPermissionsByRoleId(roleId)
          .then((res) => {
            console.log(res, "resoibse for roke");
            let temp = [];
            res?.permission.map((perm, index) => {
              temp.push(perm.id);
            });
            console.log(temp, "+++++++++++++++++++++");
            setSearchCheckdPermissionList(temp);
            dispatch(hideLoader(false));
          })
          .catch((err) => {
            dispatch(hideLoader(false));
            handleError(err);
          })
          .finally();
  };

  const renderCheckboxGroups = () => {
    const maxCheckboxesPerColumn = 10;
    const totalColumns = Math.ceil(
      permissionList.length / maxCheckboxesPerColumn
    );

    const checkboxGroups = [];
    for (let i = 0; i < totalColumns; i++) {
      const startIdx = i * maxCheckboxesPerColumn;
      const endIdx = startIdx + maxCheckboxesPerColumn;
      const checkboxesInColumn = permissionList.slice(startIdx, endIdx);

      checkboxGroups.push(
        <Col key={i} sm={12} md={6} lg={4} xl={3}>
          <CheckboxGroup
            className="mx-3 my-4 d-flex flex-column gap-3"
            options={checkboxesInColumn}
            value={checkedList}
            onChange={onChange}
          />
        </Col>
      );
    }

    return checkboxGroups;
  };

  return (
    <>
      <div className="row mt-3 mx-2">
        <h4>Permission Management</h4>
      </div>
      <Row className="mt-4">
        <Col sm={4} md={4} lg={4} xl={4}>
          <FormGroup className="ms-3">
            <Label for="exampleEmail">Select Role</Label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable
              value={
                roleList.find((option) => option.value === selectedRole.id) ||
                null
              }
              onChange={(e) => {
                handleChangeRoleSelection(e);
              }}
              options={roleList}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>{renderCheckboxGroups()}</Row>
      <Row className="d-flex mt-2 mb-3 mx-1 justify-content-end">
        <Col sm={12} md={9} lg={9} xl={10} className="align-item-end">
          {/* <Checkbox
            className="mx-3 my-4"
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            Check All Permissions
          </Checkbox> */}
        </Col>
        <Col sm={12} md={3} lg={3} xl={2}>
          <Button
            color="primary"
            className="w-auto"
            onClick={handleSavePermissionChangers}
          >
            <Check size={20} /> Save
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Permission;
