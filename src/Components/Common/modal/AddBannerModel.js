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
  //   popUploader,
} from "../../../common/commonFunctions";
import * as bannerService from "../../../service/bannerService";
const AddBannerModal = ({ isOpen, toggle }) => {
  const [position, setPosition] = useState("");
  const [isUploadModalOpen, setFileUploadModalOpen] = useState(false);

  const handleAddBanner = () => {
    let isValidated = false;

    position === ""
      ? customToastMsg("Postion name cannot be empty")
      : (isValidated = true);

    const data = {
      name: position,
      fileId: "",
      categoryId: "",
    };
    if (isValidated) {
      bannerService
        .create(data)
        .then((response) => {
          toggle();
          setPosition("");
          customToastMsg("Banner successfully created ", 1);
        })
        .catch((error) => {
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
        Add New Banner
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="position">Banner Position</Label>
            <Input
              type="select"
              name="select"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="">Select Position</option>
              <option value="TOP">TOP</option>
              <option value="MIDDLE">MIDDLE</option>
              <option value="BOTTOM">BOTTOM</option>
            </Input>
          </FormGroup>
          <FormGroup>
            {/* <Label>Upload Banner</Label> */}
            <Button
              className="upload-btn"
              onClick={() => setFileUploadModalOpen(true)}
            >
              <span>Upload Image</span>
            </Button>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            toggle();
            setPosition("");
          }}
        >
          Cancel
        </Button>{" "}
        <Button color="primary" onClick={handleAddBanner}>
          Add Banner
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddBannerModal;
