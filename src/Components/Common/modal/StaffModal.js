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
import { Upload } from "antd";
import ImgCrop from "antd-img-crop";
import moment from "moment/moment";
import { customToastMsg, handleError } from "../../../common/commonFunctions";
import * as staffService from "../../../service/staffService";
import * as rolePermssionService from "../../../service/rolePermissionService";
import * as fileService from "../../../service/fileService";
import * as countryService from "../../../service/countryService";
import { useDispatch } from "react-redux";
// import { hideLoader, showLoader } from "../../../slices/loader/loader";
// import { PhoneInput } from "react-international-phone";
// import "react-international-phone/style.css";

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

  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    getAllRoles();
    getAllCountries();
    console.log(updateValue, "---------------------");
    if (updateValue != undefined || updateValue != []) {
      setDataToInputs();
    }
  }, [isOpen]);

  const setDataToInputs = () => {
    setFirstName(updateValue?.user?.firstName);
    setLastName(updateValue?.user?.lastName);
    setEmail(updateValue?.user?.email);
    setContactNo(updateValue?.user?.contactNo);
    setSelectedRole(updateValue?.user?.role?.id);
    setSelectedCountry(updateValue?.user?.country?.dialCode);
    if (updateValue?.user?.photo) {
      setFileList([
        {
          uid: updateValue?.user?.photo?.id,
          name: "image.png",
          status: "done",
          url: updateValue?.user?.photo?.path,
        },
      ]);
      setUserImage({
        id: updateValue?.user?.photo?.id,
        path: updateValue?.user?.photo?.path,
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

  const getAllRoles = async () => {
    setRoleList([]);
    // dispatch(showLoader(true));
    const withPermission = false;
    await rolePermssionService
      .getAllRoles(withPermission)
      .then((res) => {
        let temp = [];
        res?.data.map((role, index) => {
          if (role.status === 1 && ![4].includes(role.id)) {
            temp.push({ value: role.id, label: role.name });
          }
        });
        //     console.log(temp, "000000");
        setRoleList(temp);
        //     dispatch(hideLoader(false));
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
        // dispatch(hideLoader(false));
      });
  };

  const getAllCountries = async () => {
    setCountryList([]);
    console.log("triggerd");

    await countryService
      .getAll((response) => {
        console.log(response.data, "countrrrr");
      })
      .catch((err) => {
        console.log(err, "errr in countruy funtion");
      });

    // dispatch(showLoader(true));
    // let temp = [];
    // countries.map((country, index) => {
    //   temp.push({ value: country.dial_code, label: country.country_name });
    // });
    // setCountryList(temp);
    // dispatch(hideLoader(false));
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
        id: response?.id,
        path: response?.path,
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
      : // : selectedCountry === ""
      // ? customToastMsg("Country cannot be empty")
      contactNo === ""
      ? customToastMsg("Contact number cannot be empty")
      : (isValidated = true);

    const data = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      contactNo: contactNo,
      // country: selectedCountry,
      roleId: `${selectedRole}`,
      photo: userImage,
    };
    console.log(data, "create data staff");

    if (isValidated) {
      staffService
        .create(data)
        .then(async (res) => {
          console.log(res, "creatd response");
          // clearInputs();
          // await toggle();
          // await customToastMsg("Staff create successfully", 1);
        })
        .catch((err) => {
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
      : email === ""
      ? customToastMsg("Email cannot be empty")
      : contactNo === ""
      ? customToastMsg("Contact number cannot be empty")
      : (isValidated = true);

    const data = {
      firstName: firstName,
      lastName: lastName,
      user: {
        email: email,
        contactNo: contactNo,
        country: selectedCountry,
        role: {
          id: `${selectedRole}`,
        },

        photo: userImage,
      },
    };
    if (isValidated) {
      // staffService
      //   .update(updateValue?.id, data)
      //   .then(async (res) => {
      //     // setIsSuccess(true);
      //     clearInputs();
      //     await toggle();
      //     await customToastMsg("Staff update successfully", 1);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     handleError(err);
      //   });
    }
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
          <FormGroup className="d-flex flex-column align-items-center">
            {" "}
            <Label>User Profile Image</Label>
            {/* <ImgCrop rotationSlider> */}
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
          </Row>
          <Row></Row>

          <Row>
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
                type="text"
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
