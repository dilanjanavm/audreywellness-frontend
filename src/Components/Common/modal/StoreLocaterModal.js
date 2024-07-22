import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import Select from "react-select";
import { Switch } from "antd";
import { useDispatch } from "react-redux";

const StoreLocaterModal = ({ isOpen, toggle, updateValue, isUpdate }) => {
  const [isDone, setIsDone] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [profileImg, setProfileImg] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [staffMemberStatus, setStaffMemberStatus] = useState("");

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllRoles();
    if (isUpdate) {
      let isSetData = setUpdateDetails();
      setIsDone(isSetData);
    } else {
      setIsDone(true);
    }
  }, [isOpen]);

  const setUpdateDetails = async () => {
    await setFirstName(updateValue?.firstName);
    await setLastName(updateValue?.lastName);
    await setContactNo(updateValue?.contactNo);
    // await setAddress(updateValue?.address);
    await setEmail(updateValue?.email);
    await setRoleId(updateValue?.role?.id);

    if (updateValue?.photo) {
      await setFileList([
        {
          uid: updateValue?.photo?.id,
          name: "image.png",
          status: "done",
          url: updateValue?.photo?.path,
        },
      ]);
      await setProfileImg({
        id: updateValue?.photo?.id,
        path: updateValue?.photo?.path,
      });
    }

    await setStaffMemberStatus(updateValue?.status?.id);
    return true;
  };

  const loadAllRoles = () => {
    popUploader(dispatch, true);
    getAllRolesToDropdown()
      .then((res) => {
        let temp = [];
        res?.data?.records.map((role, index) => {
          if (role.status === 1 && ![1, 3].includes(role.id)) {
            temp.push({ value: role.id, label: role.name });
          }
        });
        setRoleList(temp);
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      });
  };

  const closeModal = async () => {
    toggle(updateValue);
    await setFirstName("");
    await setLastName("");
    await setContactNo("");
    // await setAddress("");
    await setEmail("");
    await setRoleId("");
    await setProfileImg("");
    await setFileList([]);
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

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length === 0) {
      setProfileImg(""); // Clear profileImg state
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    let temp = {};
    try {
      const formData = new FormData();
      formData.append("file", file);
      // console.log(file, "595559");
      // console.log(formData, "+++++++++++");
      const response = await saveMediaFile(formData);
      temp = {
        id: response?.data?.id,
        path: response?.data?.path,
      };
      setProfileImg(temp);
      setIsUploading(true);
      // console.log(temp, "546441");
      onSuccess();
    } catch (error) {
      // console.error("Error uploading image:", error);
      onError(error.message || "Upload failed");
    }
  };

  const savenewStaffMember = () => {
    let isValidated = false;
    // profileImg.length === 0
    //   ? customToastMsg("Select image first", 2)
    firstName === ""
      ? customToastMsg("First name cannot be empty")
      : lastName === ""
      ? customToastMsg("Last name cannot be empty")
      : contactNo === ""
      ? customToastMsg("Contact no cannot be empty")
      : // : address === ""
      // ? customToastMsg("Address cannot be empty")
      email === ""
      ? customToastMsg("Email cannot be empty")
      : roleId === ""
      ? customToastMsg("Select a role")
      : (isValidated = true);

    const data = {
      photo: profileImg,
      email: email,
      firstName: firstName,
      lastName: lastName,
      contactNo: contactNo,
      // address: address,
      role: {
        id: roleId,
      },
      status: { id: 1 },
    };

    if (isValidated) {
      popUploader(dispatch, true);
      addNewUser(data)
        .then((res) => {
          popUploader(dispatch, false);
          closeModal();
          customToastMsg("User added successfully", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        })
        .finally();
    }
  };

  const updateStaffMember = () => {
    let isValidated = false;
    // profileImg.length === 0
    //   ? customToastMsg("Select image first", 2)
    firstName === ""
      ? customToastMsg("First name cannot be empty")
      : lastName === ""
      ? customToastMsg("Last name cannot be empty")
      : contactNo === ""
      ? customToastMsg("Contact no cannot be empty")
      : // : address === ""
      // ? customToastMsg("Address cannot be empty")
      email === ""
      ? customToastMsg("Email cannot be empty")
      : roleId === ""
      ? customToastMsg("Select a role")
      : (isValidated = true);

    const data = {
      photo: profileImg,
      email: email,
      firstName: firstName,
      lastName: lastName,
      contactNo: contactNo,
      // address: address,
      role: { id: roleId },
      status: { id: staffMemberStatus },
    };

    if (isValidated) {
      popUploader(dispatch, true);
      updateUser(updateValue.id, data)
        .then((res) => {
          popUploader(dispatch, false);
          closeModal();
          customToastMsg("User updated successfully", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        })
        .finally();
    }
  };

  const changeStatusProduct = () => {
    const newStatus = staffMemberStatus === 1 ? 2 : 1;
    setStaffMemberStatus(newStatus);
  };

  return (
    <Modal isOpen={isOpen} toggle={(e) => closeModal()}>
      {isUpdate ? (
        <ModalHeader toggle={(e) => closeModal()}>Update User</ModalHeader>
      ) : (
        <ModalHeader toggle={(e) => closeModal()}>Add New User</ModalHeader>
      )}

      {isDone && (
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

            <FormGroup>
              <Col sm={12} md={12} lg={12}>
                <div className="w-100 d-flex flex-column align-items-center">
                  <Label>User Image</Label>
                  <ImgCrop rotationSlider fillColor={"transparent"}>
                    <Upload
                      className="d-flex justify-content-center"
                      customRequest={customRequest}
                      listType="picture-circle"
                      fileList={fileList}
                      multiple={false}
                      onChange={onChange}
                      onPreview={onPreview}
                    >
                      {fileList.length < 1 && "+ Upload"}
                    </Upload>
                  </ImgCrop>
                </div>
              </Col>
            </FormGroup>

            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="contactNo">Contact No</Label>
              <Input
                type="tel"
                id="contactNo"
                placeholder="Eg: +00 00000000"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </FormGroup>
            {/* <FormGroup>
              <Label for="contactNo">Address</Label>
              <Input
                type="tel"
                id="contactNo"
                placeholder="Eg: 000/0 , State , City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormGroup> */}
            {!isUpdate && (
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Eg: ****@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label for="role">Select Role</Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable
                value={
                  roleList.find((option) => option.value === roleId) || null
                }
                onChange={(e) => {
                  setRoleId(e?.value === undefined ? "" : e.value);
                }}
                options={roleList}
              />
            </FormGroup>
          </Form>
        </ModalBody>
      )}
      <ModalFooter>
        <Button onClick={(e) => closeModal()}>Cancel</Button>
        {isUpdate ? (
          <Button
            onClick={() => {
              updateStaffMember();
            }}
            color="primary"
          >
            Update User
          </Button>
        ) : (
          <Button
            onClick={() => {
              savenewStaffMember();
            }}
            color="primary"
          >
            Add New User
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default StoreLocaterModal;
