import React, { useState } from "react";
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
  //   popUploader,
} from "../../../common/commonFunctions";
import * as roleService from "../../../service/rolePermissionService";
import { useDispatch } from "react-redux";
const AddRoleModal = ({ isOpen, toggle }) => {
  const [roleName, setRoleName] = useState("");
  let dispatch = useDispatch();

  const handleAddRole = () => {
    let isValidated = false;

    roleName === ""
      ? customToastMsg("Role name cannot be empty")
      : (isValidated = true);

    const data = {
      name: roleName,
    };
    if (isValidated) {
      roleService
        .createRole(data)
        .then((response) => {
          popUploader(dispatch, false);

          toggle();
          setRoleName("");
          customToastMsg("Role successfully created ", 1);
        })
        .catch((error) => {
          popUploader(dispatch, false);
          console.log(error);
          handleError(error);
        })
        .finally();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        toggle();
      }}
    >
      <ModalHeader
        toggle={() => {
          toggle();
        }}
      >
        Add New Role
      </ModalHeader>
      <ModalBody>
        <Form>
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
            toggle();
            setRoleName("");
          }}
        >
          Cancel
        </Button>{" "}
        <Button color="primary" onClick={handleAddRole}>
          Add Role
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddRoleModal;
