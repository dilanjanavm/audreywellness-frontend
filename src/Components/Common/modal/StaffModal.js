import React, { useState, useEffect } from "react";
import {
  Row,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Select from "react-select";
import { Switch, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import moment from "moment/moment";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import * as staffService from "../../../service/staffService";
import * as rolePermissionService from "../../../service/rolePermissionService";
import * as fileService from "../../../service/fileService";
import { useDispatch } from "react-redux";
import { getAllCountries } from "../../../service/countryService";

const StaffModel = ({ isOpen, toggle, updateValue, isUpdate }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [userImage, setUserImage] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [file, setFile] = useState("");

  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [staffMemberStatus, setStaffMemberStatus] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    loadAllCountries();
    loadAllRoles();
    console.log(updateValue, "---------------------");
    if (updateValue != undefined || updateValue != []) {
      setDataToInputs();
    }
  }, [isOpen]);

  const setDataToInputs = () => {
    setFirstName(updateValue?.user?.firstName);
    setLastName(updateValue?.user?.lastName);
    setEmail(updateValue?.user?.email);
    setContactNo(updateValue?.user?.staff?.contactNo);
    setSelectedRole(updateValue?.user?.role?.id);
    setSelectedCountry(updateValue?.user?.country?.dialCode);
    setStaffMemberStatus(updateValue?.user?.status);
    if (updateValue?.user?.file) {
      setFileList([
        {
          uid: updateValue?.user?.file?.id,
          name: "image.png",
          status: "done",
          url: updateValue?.user?.file?.originalPath,
        },
      ]);
      setUserImage({
        id: updateValue?.user?.file?.id,
        path: updateValue?.user?.file?.originalPath,
      });
    }
  };
  const clearInputs = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setContactNo("");
    setSelectedRole("");
    setSelectedCountry("");
    setUserImage([]);
    setFileList([]);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const loadAllRoles = async () => {
    setRoleList([]);
    const status = 1;
    await rolePermissionService
      .getAllRolesWithStatusToDropdown(status)
      .then((res) => {
        let temp = [];
        res?.data.records.map((role, index) => {
          if (
            role.status === 1 &&
            role?.name != "CUSTOMER" &&
            role?.name != "SUPER_ADMIN"
          ) {
            temp.push({ value: role.id, label: role.name });
          }
        });
        setRoleList(temp);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
        popUploader(dispatch, false);
      });
  };

  const loadAllCountries = () => {
    setCountryList([]);
    console.log("method called");
    getAllCountries()
      .then((res) => {
        let temp = [];
        res?.data.map((country, index) => {
          temp.push({ value: country.dialCode, label: country.countryName });
        });
        setCountryList(temp);
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
      });
  };

  const onChangeUserImage = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      console.log("FIle:", file);
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormData:", formData);

      const response = await fileService.upload(formData);
      console.log("Upload response:", response);

      const temp = {
        id: response?.data?.id,
        path: response?.data?.originalPath,
      };
      console.log(temp);
      setUserImage(temp);
      setIsUploading(true);
      onSuccess();
    } catch (error) {
      console.error("Error uploading image:", error);
      onError(error.message || "Upload failed");
    }
  };

  const createNewStaff = () => {
    let isValidated = false;
    userImage === ""
      ? customToastMsg("Upload user image first")
      : firstName === ""
      ? customToastMsg("First name cannot be empty")
      : lastName === ""
      ? customToastMsg("Last name cannot be empty")
      : email === ""
      ? customToastMsg("Email cannot be empty")
      : selectedRole === ""
      ? customToastMsg("Select role")
      : selectedCountry === ""
      ? customToastMsg("Country cannot be empty")
      : contactNo === ""
      ? customToastMsg("Contact number cannot be empty")
      : (isValidated = true);

    const data = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      contactNo: contactNo,
      country: selectedCountry,
      roleId: `${selectedRole}`,
      fileId: userImage?.id,
    };
    console.log(data, "create data staff");

    if (isValidated) {
      popUploader(dispatch, true);

      staffService
        .createStaff(data)
        .then((res) => {
          popUploader(dispatch, false);
          clearInputs();
          toggle();
          customToastMsg("Staff successfully created", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          console.log(err);
          handleError(err);
        });
    }
  };
  const handleUpdateNewUser = () => {
    let isValidated = false;
    userImage === ""
      ? customToastMsg("Upload user image first")
      : firstName === ""
      ? customToastMsg("First name cannot be empty")
      : lastName === ""
      ? customToastMsg("Last name cannot be empty")
      : selectedRole === ""
      ? customToastMsg("Select role")
      : selectedCountry === ""
      ? customToastMsg("Country cannot be empty")
      : contactNo === ""
      ? customToastMsg("Contact number cannot be empty")
      : (isValidated = true);

    const data = {
      firstName: firstName,
      lastName: lastName,
      email: updateValue?.user?.email,
      contactNo: contactNo,
      country: selectedCountry,
      status: staffMemberStatus,
      roleId: `${selectedRole}`,
      fileId: userImage?.id,
    };

    if (isValidated) {
      popUploader(dispatch, true);

      staffService
        .updateStaff(updateValue?.user?.staff?.id, data)
        .then((res) => {
          console.log(res);
          popUploader(dispatch, false);
          clearInputs();
          toggle();
          customToastMsg("Staff successfully updated", 1);
        })
        .catch((err) => {
          console.log(err);
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  const changeStatusProduct = () => {
    const newStatus = staffMemberStatus === 1 ? 2 : 1;
    setStaffMemberStatus(newStatus);
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      toggle={() => {
        toggle(updateValue);
        clearInputs();
      }}
    >
      {isUpdate ? (
        <ModalHeader
          toggle={(e) => {
            toggle(updateValue);
            clearInputs();
          }}
        >
          Update User
        </ModalHeader>
      ) : (
        <ModalHeader
          toggle={(e) => {
            toggle(updateValue);
            clearInputs();
          }}
        >
          Add New User
        </ModalHeader>
      )}

      <ModalBody>
        <Form>
          {isUpdate && (
            <FormGroup>
              <Label for="staffmemberStatus">User Status</Label>
              <Switch
                className="ms-4"
                checked={
                  staffMemberStatus === 1
                    ? true
                    : staffMemberStatus === 2
                    ? false
                    : false
                }
                onChange={(e) => {
                  changeStatusProduct();
                }}
                handleBg={staffMemberStatus === 1 ? "#60b24c" : "#bababa"}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                style={{
                  backgroundColor:
                    staffMemberStatus === 1 ? "#60b24c" : "#bababa",
                }}
              />
            </FormGroup>
          )}

          <FormGroup className="d-flex flex-column align-items-center">
            {" "}
            <Label>User Profile Image</Label>
            {/* <ImgCrop
              rotationSlider
              style={{ position: "absolute !important", zIndex: "9999999999 !important" }}
            > */}
            <Upload
              className="d-flex justify-content-center"
              customRequest={customRequest}
              action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
              listType="picture-circle"
              fileList={fileList}
              onChange={onChangeUserImage}
              onPreview={onPreview}
            >
              {fileList.length < 1 && "+ Upload"}
            </Upload>
            {/* </ImgCrop> */}
          </FormGroup>
          <Row>
            <FormGroup className="col-12 col-lg-6">
              <Label for="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormGroup>
            <FormGroup className="col-12 col-lg-6">
              <Label for="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormGroup>
          </Row>
          <Row>
            {isUpdate ? (
              ""
            ) : (
              <FormGroup className="col-12 col-lg-6">
                <Label for="email">Email</Label>
                <Input
                  type="text"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup className="col-12 col-lg-6">
              <Label for="role">Select Role</Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable
                value={
                  roleList.find((option) => option.value === selectedRole) ||
                  null
                }
                onChange={(e) => {
                  setSelectedRole(
                    e?.value === undefined ? "" : e === null ? "" : e.value
                  );
                }}
                options={roleList}
              />
            </FormGroup>

            <FormGroup className="col-12 col-lg-6">
              <Label for="role">Select Country</Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable
                value={
                  countryList.find(
                    (option) => option.value === selectedCountry?.dialCode
                  ) || null
                }
                onChange={(e) => {
                  setSelectedCountry(
                    e?.value === undefined
                      ? ""
                      : e === null
                      ? ""
                      : { countryName: e.label, dialCode: e.value }
                  );
                }}
                options={countryList}
              />
            </FormGroup>

            <FormGroup className="col-12 col-lg-6">
              <Label for="contactNo">Contact No</Label>
              <Input
                type="number"
                id="contactNo"
                placeholder="Enter your contact number"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </FormGroup>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            toggle(updateValue);
            clearInputs();
          }}
        >
          Cancel
        </Button>{" "}
        {isUpdate ? (
          <Button
            color="primary"
            onClick={() => {
              handleUpdateNewUser();
            }}
          >
            Update User
          </Button>
        ) : (
          <Button
            // disabled={!isUploading}
            color="primary"
            onClick={() => {
              createNewStaff();
            }}
          >
            Add New User
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
export default StaffModel;
