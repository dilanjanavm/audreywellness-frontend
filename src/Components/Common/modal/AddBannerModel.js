import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import { DownOutlined } from "@ant-design/icons";

import { Upload } from "react-feather";
import { Dropdown, Menu, Button, Select } from "antd";
import { getAllCategoriesWithSubCategories } from "../../../service/categoryService";

const AddBannerModal = ({ isOpen, toggle }) => {
  const [position, setPosition] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProductCategoryName, setSelectedProductCategoryName] =
    useState("");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");

  const [isUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [bannerPositions, setBannerPositions] = useState([]);

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
    setBannerPositions([
      { value: "TOP", label: "TOP" },
      { value: "MIDDLE", label: "MIDDLE" },
      { value: "BOTTOM", label: "BOTTOM" },
    ]);
  }, [isOpen]);

  const handleAddBanner = () => {
    let isValidated = false;

    position === ""
      ? customToastMsg("Select position")
      : selectedCategoryId === ""
      ? customToastMsg("Select category")
      : uploadedFile.length === 0
      ? customToastMsg("Select image")
      : (isValidated = true);

    let temp = "";
    uploadedFile.length === 1
      ? uploadedFile.map((img) => {
          temp = img.id;
        })
      : (temp = "");

    const data = {
      position: position,
      fileId: temp,
      categoryId: selectedCategoryId,
    };
    console.log(data, "00000");

    if (isValidated) {
      bannerService
        .create(data)
        .then((response) => {
          toggle();
          setPosition("");
          setSelectedCategoryId("");
          setUploadedFile([]);
          customToastMsg("Banner successfully created ", 1);
        })
        .catch((error) => {
          console.log(error);
          handleError(error);
        })
        .finally();
    }
  };

  const loadAllCategoriesWithSubCategories = () => {
    setCategoryList([]);
    getAllCategoriesWithSubCategories()
      .then((res) => {
        const formattedCategories = res.data.map((cat) => ({
          key: cat.id,
          label: cat.name,
          children:
            cat.children.length > 0
              ? cat.children.map((subCat) => ({
                  key: subCat.id,
                  label: subCat.name,
                  parentLabel: cat.name,
                }))
              : null,
        }));
        setCategoryList(formattedCategories);
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
      });
  };

  const handleMenuClick = ({ key, item }) => {
    console.log(key, item);
    setSelectedCategoryId(key);
    const parentLabel = item.props.parentLabel;
    if (parentLabel) {
      setSelectedProductCategoryName(parentLabel);
      setSelectedSubCategoryName(item.props.label); // Set the subcategory name
    } else {
      setSelectedProductCategoryName(item.props.label);
      setSelectedSubCategoryName(""); // Clear the subcategory name
    }
  };

  const renderMenu = (categories) => (
    <Menu onClick={handleMenuClick}>
      {categories.map((category) =>
        category.children ? (
          <Menu.SubMenu key={category.key} title={category.label}>
            {category.children.map((subCategory) => (
              <Menu.Item
                key={subCategory.key}
                parentLabel={category.label}
                label={subCategory.label}
              >
                {subCategory.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ) : (
          <Menu.Item key={category.key} label={category.label}>
            {category.label}
          </Menu.Item>
        )
      )}
    </Menu>
  );

  const displayCategory = selectedSubCategoryName
    ? `${selectedProductCategoryName} > ${selectedSubCategoryName}`
    : selectedProductCategoryName || "Select...";

  const openToggle = () => {
    setImageModalOpen(!imageModalOpen);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        toggle();
        setPosition("");
        setSelectedCategoryId("");
        setUploadedFile([]);
      }}
    >
      <ModalHeader
        toggle={() => {
          toggle();
          setPosition("");
          setSelectedCategoryId("");
          setUploadedFile([]);
        }}
      >
        Add New Banner
      </ModalHeader>
      <ModalBody>
        <Form>
          <FileUploadModal
            isOpen={imageModalOpen}
            toggle={openToggle}
            isMultiple={false}
            uploadLimit={1}
            onFileUploadSuccess={(files) => {
              setUploadedFile(files);
            }}
          />
          <FormGroup>
            <Label for="position">Banner Position</Label>
            <Select
              id="position"
              placeholder="Select..."
              allowClear
              value={
                bannerPositions.find((tag) => tag.value === position) ||
                undefined
              }
              onChange={(value) => setPosition(value)}
              style={{ width: "100%", height: 40 }}
            >
              {bannerPositions.map((pos) => (
                <Option key={pos.value} value={pos.value}>
                  {pos.label}
                </Option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup className="col-12 d-flex flex-column">
            <Label for="productCategory">Select Product Category</Label>
            <Dropdown overlay={renderMenu(categoryList)}>
              <Button
                className="w-100 text-start"
                style={{ color: "#878a99", height: 40 }}
              >
                <span style={{ width: "95%" }}>{displayCategory}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </FormGroup>
          <FormGroup>
            <button
              className={"mt-2 clickToUploadButton w-100"}
              type="button"
              onClick={openToggle}
            >
              <Upload className={"upload_icon"} size={15} />
              Click To Upload
            </button>
          </FormGroup>
          <FormGroup className="col-5">
            {uploadedFile && uploadedFile.length > 0 && (
              <div className="d-flex my-2 flex-wrap">
                {uploadedFile.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.path}
                    alt="productImage"
                    className="mx-2"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                    onError={(e) =>
                      (e.target.src =
                        "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                    }
                  />
                ))}
              </div>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button
          className="btn btn-secondary "
          onClick={() => {
            toggle();
            setPosition("");
            setSelectedCategoryId("");
            setUploadedFile([]);
          }}
        >
          Cancel
        </button>{" "}
        <button className="btn btn-primary " onClick={handleAddBanner}>
          Add Banner
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default AddBannerModal;
