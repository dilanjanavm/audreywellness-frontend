import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import styles from "../../../assets/scss/custom/FileUploadModal.module.scss";

import { InboxOutlined } from "@ant-design/icons";
import { message, Upload, Tooltip } from "antd";
import LazyLoad from "react-lazyload";
import "../../../assets/scss/components/banner.scss";

// import FeatherIcon from "feather-icons-react/build/FeatherIcon";

const { Dragger } = Upload;

import * as fileService from "../../../service/fileService";

export default function FileUploadModal({
  isOpen,
  toggle,
  isMultiple,
  onFileUploadSuccess,
}) {
  //  const [modal, setModal] = useState(false);
  const [isMediaCenterOpen, setIsMediaCenterOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // const toggle = () => setModal(!modal);

  // const props = {
  //   name: "file",
  //   multiple: isMultiple,
  //   action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  //   onChange(info) {
  //     const { status } = info.file;
  //     if (status !== "uploading") {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (status === "done") {
  //       message.success(`${info.file.name} file uploaded successfully.`);
  //     } else if (status === "error") {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  //   onDrop(e) {
  //     console.log("Dropped files", e.dataTransfer.files);
  //   },
  // };
  const props = {
    name: "file",
    multiple: isMultiple,
    customRequest: async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fileService.upload(formData); // Assuming uploadFile handles multipart form data
        onSuccess(response, file);
        onFileUploadSuccess(response.data);
        message.success(`${file.name} file uploaded successfully.`);
      } catch (error) {
        console.error("File upload error:", error);
        onError(error);
        message.error(`${file.name} file upload failed.`);
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };
  useEffect(() => {
    getAll();
  }, []);

  const getAll = () => {
    fileService
      .getAll()
      .then(async (res) => {
        const imagesArray = await res.data.records; // Assuming records is an array of images
        setImages(imagesArray);
        console.log("images : ", imagesArray);
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

  return (
    <div>
      {/* <Button color="secondary" onClick={toggle}>
        Upload Image
      </Button> */}
      {/* <button
        className={"mt-2 clickToUploadButton"}
        type="button"
        onClick={toggle}
      >
        <Upload className={"upload_icon"} size={15} />
        Click To Upload
      </button> */}

      <Modal isOpen={isOpen} toggle={toggle} size={"lg"}>
        <ModalHeader toggle={toggle}>Choose an image</ModalHeader>
        <ModalBody>
          <Button
            onClick={() => {
              setIsMediaCenterOpen(false);
            }}
          >
            Local upload
          </Button>
          <Button
            onClick={() => {
              setIsMediaCenterOpen(true);
            }}
          >
            Media center
          </Button>
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
            <Dragger {...props}>
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
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Confirm upload
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
