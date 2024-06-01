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
  //   popUploader,
} from "../../../common/commonFunctions";
import * as bannerService from "../../../service/bannerService";
import FileUploadModal from "./FileUploadModal";
import { DownOutlined } from "@ant-design/icons";

import { Upload } from "react-feather";
import { Dropdown, Menu } from "antd";
import { getAllCategoriesWithSubCategories } from "../../../service/categoryService";

const AddBannerModal = ({ isOpen, toggle }) => {
  const [position, setPosition] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProductCategoryName, setSelectedProductCategoryName] =
    useState("");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");

  const [isUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
  }, []);

  const handleAddBanner = () => {
    let isValidated = false;

    position === ""
      ? customToastMsg("Postion name cannot be empty")
      : (isValidated = true);

    const data = {
      position: position,
      fileId: uploadedFile?.id,
      categoryId: selectedCategoryId,
    };
    if (isValidated) {
      bannerService
        .create(data)
        .then((response) => {
          toggle();
          setPosition("");
          setSelectedCategoryId("");
          setUploadedFile(null);
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

            <Label for="productCategory">Select Product Category</Label>
            <Dropdown overlay={renderMenu(categoryList)}>
              <Button
                className="w-100 text-start"
                style={{
                  color: "#000", 
                  backgroundColor: "#fff", 
                  borderColor: "#ccc", 
                  height: 40,
                }}
              >
                <span style={{ width: "95%" }}>{displayCategory}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </FormGroup>
          <FormGroup>
            <FileUploadModal
              isOpen={imageModalOpen}
              toggle={openToggle}
              isMultiple={false}
              onFileUploadSuccess={setUploadedFile}
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
            setSelectedCategoryId("");
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
