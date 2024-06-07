import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NavItem,
  NavLink,
  Nav,
} from "reactstrap";

import styles from "../../../assets/scss/custom/FileUploadModal.module.scss";

import { InboxOutlined } from "@ant-design/icons";
import { message, Upload, Tooltip } from "antd";
import LazyLoad from "react-lazyload";
import "../../../assets/scss/components/banner.scss";

// import FeatherIcon from "feather-icons-react/build/FeatherIcon";

const { Dragger } = Upload;

import * as fileService from "../../../service/fileService";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import { Trash } from "react-feather";
import { useDispatch } from "react-redux";

export default function FileUploadModal({
  isOpen,
  toggle,
  isMultiple,
  onFileUploadSuccess,
  uploadLimit,
}) {
  const [isMediaCenterOpen, setIsMediaCenterOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [fileList, setFileList] = useState([]);
  const [uploadedFileIds, setUploadedFileIds] = useState([]);
  const [isUploadLimitExceeded, setIsUploadLimitExceeded] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(fileList, "/////////////////////////");
  }, [fileList]);

  useEffect(() => {
    setIsUploadLimitExceeded(fileList.length > uploadLimit);
    if (fileList.length > uploadLimit) {
      customToastMsg(
        " Upload limit exceeded. Please remove some files to proceed.",
        2
      );
    }
  }, [fileList, uploadLimit]);

  const props = {
    name: "file",
    multiple: isMultiple,
    customRequest: async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fileService.upload(formData);
        console.log(response, "000000");
        let temp = {
          id: response?.data?.id,
          path: response?.data?.originalPath,
        };
        await setUploadedFileIds((prevIds) => [...prevIds, temp]);

        setFileList((prevIds) => [...prevIds, temp]);
        onSuccess(response, file);
      } catch (error) {
        handleError(error);
        console.error("Error uploading image:", error);
        onError(error);
      }

      // try {
      //   const response = await fileService.upload(formData); // Assuming uploadFile handles multipart form data
      //   onSuccess(response, file);
      //   onFileUploadSuccess(response.data);

      //   message.success(`${file.name} file uploaded successfully.`);
      // } catch (error) {
      //   console.error("File upload error:", error);
      //   onError(error);
      //   message.error(`${file.name} file upload failed.`);
      // }
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        // console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    // onDrop(e) {
    //   console.log("Dropped files", e.dataTransfer.files);
    // },
  };
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  useEffect(() => {
    getAll();
  }, []);

  const getAll = async () => {
    // popUploader(dispatch, true);

    await fileService
      .getAll()
      .then(async (res) => {
        // popUploader(dispatch, false);

        const imagesArray = await res.data.records; // Assuming records is an array of images
        setImages(imagesArray);
        // console.log("images : ", imagesArray);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleImageClick = (image) => {
    setSelectedImage((prevSelectedImage) => {
      const newSelectedImage = prevSelectedImage === image.id ? null : image.id;
      console.log("Selected image:", newSelectedImage);
      return newSelectedImage;
    });
  };

  const getBorderStyle = (imageId) => {
    return selectedImage === imageId
      ? { border: "2px solid #29d4ff" }
      : { border: "2px solid #f7f7f7" };
  };

  const truncateName = (name, length) => {
    if (name.length <= length) {
      return name;
    }
    return name.substring(0, length) + "...";
  };

  const removeFile = (file) => {
    const newFileList = fileList.filter((f) => f.id !== file.id);
    setFileList(newFileList);
  };

  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle} size={"lg"}>
        <ModalHeader toggle={toggle}>Choose an image</ModalHeader>
        <ModalBody>
          {/* <Button
            onClick={() => {
              setIsMediaCenterOpen(false);
            }}
          >
            Local Upload
          </Button>
          <Button
            onClick={() => {
              setIsMediaCenterOpen(true);
            }}
          >
            Media Center
          </Button> */}
          <Nav tabs>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={{ active: activeTab === "1" }}
                onClick={() => {
                  setIsMediaCenterOpen(false);
                  toggleTab("1");
                }}
              >
                Local Upload
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={{ active: activeTab === "2" }}
                onClick={() => {
                  setIsMediaCenterOpen(true);
                  toggleTab("2");
                }}
              >
                Media center
              </NavLink>
            </NavItem>
          </Nav>
          <hr />

          {isMediaCenterOpen ? (
            <div>
              <div>
                <ul className={styles.imageList}>
                  {images.map((image) => (
                    <LazyLoad height={200} offset={100} key={image.id}>
                      <div
                        className={styles.imageContainer}
                        key={image.id}
                        style={{ ...getBorderStyle(image.id) }}
                        onClick={() => handleImageClick(image)}
                      >
                        <Tooltip title={image.originalName} placement="right">
                          <img
                            src={image.smallPath}
                            alt={image.originalName}
                            className={`${styles.imageItem}`}
                          />
                        </Tooltip>

                        <p className={styles.itemName}>
                          {truncateName(image.originalName, 10)}
                        </p>
                      </div>
                    </LazyLoad>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <Dragger
              {...props}
              beforeUpload={() => {
                return fileList.length < uploadLimit;
              }}
              disabled={fileList.length >= uploadLimit}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          )}
          <div className="d-flex flex-wrap">
            {fileList.map((file) => (
              <div key={file.id} style={{ position: "relative" }}>
                <img
                  key={file.id}
                  src={file.path}
                  alt="productImage"
                  className="mx-2"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                  onError={(e) =>
                    (e.target.src = "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                  }
                />

                <Trash
                  onClick={() => removeFile(file)}
                  size={20}
                  className="shadow"
                  style={{
                    position: "absolute",
                    backgroundColor: "white",
                    borderRadius: 2,
                    color: "gray",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                  }}
                />
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              onFileUploadSuccess(fileList);
              toggle();
              setFileList([]);
            }}
            disabled={isUploadLimitExceeded} // Add this line
          >
            Confirm upload
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => {
              toggle();
              setFileList([]);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
