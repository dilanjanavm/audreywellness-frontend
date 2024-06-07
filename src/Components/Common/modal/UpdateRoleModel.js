import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";

import * as roleService from "../../../service/rolePermissionService";

import { Switch } from "antd";
import { useDispatch } from "react-redux";

const UpdateRoleModal = ({ isOpen, currentData, onClose }) => {
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState("");
  let dispatch = useDispatch();

  useEffect(() => {
    setRoleName(currentData.name);
    setRoleStatus(currentData.status);
  }, [isOpen]);

  const handleUpdateRole = () => {
    let isValidated = false;

    roleName === ""
      ? customToastMsg("Role name cannot be empty")
      : (isValidated = true);

    const data = {
      name: roleName,
      status: roleStatus,
    };

    if (isValidated) {
      popUploader(dispatch, true);
      roleService
        .update(currentData.id, data)
        .then((response) => {
          // popUploader(dispatch, false);
          onClose();
          setRoleName("");
          setRoleStatus("");
          customToastMsg("Role successfully updated ", 1);
        })
        .catch((err) => {
          console.log(err);
          popUploader(dispatch, false);
          handleError(err);
        })
        .finally();
    }
  };

  const changeStatusProduct = () => {
    const newStatus = roleStatus === 1 ? 2 : 1;
    setRoleStatus(newStatus);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        onClose();
      }}
    >
      <ModalHeader
        toggle={() => {
          onClose();
        }}
      >
        Add New Role
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="roletStatus">Role Status</Label>
            <Switch
              className="ms-4"
              checked={
                roleStatus === 1 ? true : roleStatus === 2 ? false : false
              }
              onChange={(e) => {
                changeStatusProduct();
              }}
              handleBg={roleStatus === 1 ? "#60b24c" : "#bababa"}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              style={{
                backgroundColor: roleStatus === 1 ? "#60b24c" : "#bababa",
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="roleName">Role Name</Label>
            <Input
              type="text"
              id="roleName"
              placeholder="Eg: Admin"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            onClose();
            setRoleName("");
          }}
        >
          Cancel
        </Button>{" "}
        <Button color="primary" onClick={handleUpdateRole}>
          Update Role
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpdateRoleModal;
