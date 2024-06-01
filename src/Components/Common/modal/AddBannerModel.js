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
import FileUploadModal from "./FileUploadModal";
import { Upload } from "react-feather";

const AddBannerModal = ({ isOpen, toggle }) => {
  const [position, setPosition] = useState("");
  const [isUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleAddBanner = () => {
    let isValidated = false;

    position === ""
      ? customToastMsg("Postion name cannot be empty")
      : (isValidated = true);

    const data = {
      position: position,
      fileId: "4bc81b6d-eb20-45f0-b711-660a6dedbf5d",
      categoryId: "8da4f190-4b0d-41c8-bce1-3d606cf09ea2",
    };
    console.log(data, "banner create data");
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
  const openToggle = () => {
    setImageModalOpen(!imageModalOpen);
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
            {/* <Button
              className="upload-btn"
              onClick={() => setFileUploadModalOpen(true)}
            >
              <span>Upload Image</span>
            </Button> */}
            <FileUploadModal
              isOpen={imageModalOpen}
              toggle={openToggle}
              isMultiple={false}
            />
            <button
              className={"mt-2 clickToUploadButton w-100"}
              type="button"
              onClick={openToggle}
            >
              <Upload className={"upload_icon"} size={15} />
              Click To Upload
            </button>
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
