import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { desMaxLimit } from "../../common/util";
import {
  countDescription,
  customSweetAlert,
  customToastMsg,
  handleError,
} from "../../common/commonFunctions";
import { DownOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Dropdown, Menu, Select, Table } from "antd";
import { getAllCategoriesWithSubCategories } from "../../service/categoryService";
import { getAllAttributesWithTags } from "../../service/attributeAndTagService";
import { ArrowLeft } from "react-feather";
import { useNavigate } from "react-router-dom";
import ProductVariantsFormRepeater from "../../Components/Common/formRepeters/ProductVariantsFormRepeater";

const { Option } = Select;

const AddNewProduct = () => {
  document.title = "Add Product | Address Shop";

  const history = useNavigate();

  const [productName, setProductName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [productDes, setProductDes] = useState("");
  const [manufactureDetails, setManufactureDetails] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [productVariantDetails, setProductVariantDetails] = useState([]);

  //---------------------data show --------------------------------------
  const [categoryList, setCategoryList] = useState([]);
  const [selectedProductCategoryName, setSelectedProductCategoryName] =
    useState("");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");
  const [attributesAndTagList, setAttributesAndTagList] = useState([]);

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
    loadAllAttributesWithTags();
  }, []);

  useEffect(() => {
    console.log(selectedTags, "selectedTags");
  }, [selectedTags]);

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

  const loadAllAttributesWithTags = () => {
    setAttributesAndTagList([]);
    getAllAttributesWithTags()
      .then((res) => {
        setAttributesAndTagList(res.data);
      })
      .catch((err) => {
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

  const handleTagSelection = (attributeId, tagId) => {
    setSelectedTags((prevSelectedTags) => {
      const newTags = prevSelectedTags.filter(
        (tag) => tag.attributeId !== attributeId
      );
      if (tagId !== undefined) {
        newTags.push({ attributeId, tagId });
      }
      return newTags;
    });
  };

  const renderAttributeDropdowns = () => {
    return attributesAndTagList.map((attribute) => {
      if (!attribute.isDefault) {
        return (
          <FormGroup className="col-3" key={attribute.id}>
            <Label>{attribute.name}</Label>
            <Select
              allowClear
              showSearch
              placeholder="Select..."
              style={{ width: "100%", height: 40 }}
              value={
                selectedTags.find((tag) => tag.attributeId === attribute.id)
                  ?.tagId || undefined
              }
              onChange={(value) => handleTagSelection(attribute.id, value)}
            >
              {attribute.tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </FormGroup>
        );
      }
      return null;
    });
  };

  const handleCreateProduct = () => {
    let validation = false;

    productName.trim() === ""
      ? customToastMsg("Product name cannot be empty", 2)
      : selectedCategoryId.trim() === ""
      ? customToastMsg("Select product category", 2)
      : productDes.trim() === ""
      ? customToastMsg("Product description cannot be empty", 2)
      : countDescription(productDes) > desMaxLimit
      ? customToastMsg("Product description limit exceed", 2)
      : manufactureDetails.trim() === ""
      ? customToastMsg("Manufacture details cannot be empty", 2)
      : countDescription(manufactureDetails) > desMaxLimit
      ? customToastMsg("Manufacture details limit exceed", 2)
      : selectedTags.length === 0
      ? customToastMsg("Select product attributes", 2)
      : productVariantDetails.length === 0
      ? customToastMsg("Select product variant details", 2)
      : (validation = true);

    if (validation) {
      const data = {
        name: productName,
        description: productDes,
        manufactureDetails: manufactureDetails,
        fileId: "eb780d00-5988-4ff3-8289-a892c8381b3a",
        categoryId: selectedCategoryId,
        productAttributeAndTagIds: selectedTags,
        productVariants: productVariantDetails,
      };

      console.log(data);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex mt-3">
          {" "}
          <ArrowLeft
            style={{ cursor: "pointer" }}
            size={18}
            onClick={() => {
              history("/product-management");
            }}
          />{" "}
          <h4>Add New Product</h4>
        </div>

        <Card>
          <CardHeader>
            <h6>Basic Information</h6>
          </CardHeader>
          <CardBody>
            <Row>
              <FormGroup className="col-6">
                <Label for="productName">Product Name</Label>
                <Input
                  type="text"
                  name="productName"
                  id="productName"
                  placeholder="Eg: Vegetable"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </FormGroup>
              <FormGroup className="col-3 d-flex flex-column">
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
            </Row>
            <Row>
              <FormGroup className="col-6">
                <div>
                  <div className="d-flex justify-content-between">
                    <Label>Product Description</Label>
                    {countDescription(productDes) > desMaxLimit ? (
                      <span className="text-count text-danger">
                        {countDescription(productDes)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    ) : (
                      <span className="text-count text-muted">
                        {countDescription(productDes)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    )}
                  </div>
                  <CKEditor
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setProductDes(data);
                    }}
                    config={{
                      toolbar: {
                        items: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "alignment",
                          "|",
                          "indent",
                          "outdent",
                          "|",
                          "fontColor",
                          "fontSize",
                          "fontBackgroundColor",
                          "|",
                          "undo",
                          "redo",
                          "|",
                          "cut",
                          "copy",
                          "paste",
                          "|",
                          "removeFormat",
                          "|",
                          "blockQuote",
                          "horizontalLine",
                          "|",
                          "code",
                          "|",
                          "specialCharacters",
                          "|",
                        ],
                      },
                    }}
                    editor={ClassicEditor}
                    data={productDes}
                    onReady={(editor) => {}}
                  />
                </div>
              </FormGroup>
              <FormGroup className="col-6">
                <div>
                  <div className="d-flex justify-content-between">
                    <Label>Manufacture Details</Label>
                    {countDescription(manufactureDetails) > desMaxLimit ? (
                      <span className="text-count text-danger">
                        {countDescription(manufactureDetails)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    ) : (
                      <span className="text-count text-muted">
                        {countDescription(manufactureDetails)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    )}
                  </div>
                  <CKEditor
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setManufactureDetails(data);
                    }}
                    config={{
                      toolbar: {
                        items: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "alignment",
                          "|",
                          "indent",
                          "outdent",
                          "|",
                          "fontColor",
                          "fontSize",
                          "fontBackgroundColor",
                          "|",
                          "undo",
                          "redo",
                          "|",
                          "cut",
                          "copy",
                          "paste",
                          "|",
                          "removeFormat",
                          "|",
                          "blockQuote",
                          "horizontalLine",
                          "|",
                          "code",
                          "|",
                          "specialCharacters",
                          "|",
                        ],
                      },
                    }}
                    editor={ClassicEditor}
                    data={manufactureDetails}
                    onReady={(editor) => {}}
                  />
                </div>
              </FormGroup>
            </Row>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h6>Product Attributes</h6>
          </CardHeader>
          <CardBody>
            <Row>{renderAttributeDropdowns()}</Row>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h6>Variants, Price, Stock</h6>
          </CardHeader>
          <CardBody>
            <ProductVariantsFormRepeater
              getProductVariantData={(data) => {
                console.log(data, "in main class");
                setProductVariantDetails([]);
                setProductVariantDetails(data);
              }}
            />
          </CardBody>
        </Card>
        <Row className="d-flex justify-content-end">
          <div className="text-end mb-3 col-4">
            <button
              type="button"
              onClick={() => handleCreateProduct()}
              className="w-100 btn btn-primary w-sm"
            >
              Save Product
            </button>
          </div>
          <div className="text-end mb-3  col-2">
            <button
              type="button"
              onClick={() => {
                customSweetAlert(
                  "When you cancel you will lose the data you entered. Are you sure to cancel?",
                  2,
                  () => {
                    history("/product-management");
                  }
                );
              }}
              className="w-100 btn btn-secondary w-sm"
            >
              Cancel
            </button>
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default AddNewProduct;
