import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { desMaxLimit } from "../../common/util";
import { countDescription, handleError } from "../../common/commonFunctions";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import { getAllCategoriesWithSubCategories } from "../../service/categoryService";
import { getAllAttributesWithTags } from "../../service/attributeAndTagService";

const AddNewProduct = () => {
  const [productName, setProductName] = useState("");
  const [selectedProductCategoryName, setSelectedProductCategoryName] =
    useState("");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [productDes, setProductDes] = useState("");
  const [manufactureDetails, setManufactureDetails] = useState("");

  const [attributesAndTagList, setAttributesAndTagList] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
    loadAllAttributesWithTags();
  }, []);
  useEffect(() => {
    console.log(selectedTags, "selected tag list");
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
    console.log(attributeId, "attibute", tagId, "tag");
    setSelectedTags((prevSelectedTags) => ({
      ...prevSelectedTags,
      [attributeId]: tagId,
    }));
  };

  const renderAttributeDropdowns = () => {
    return attributesAndTagList.map((attribute) => {
      if (!attribute.isDefault) {
        return (
          <FormGroup className="col-3" key={attribute.id}>
            <Label>{attribute.name}</Label>
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => handleTagSelection(attribute.id, key)}
                >
                  {attribute.tags.map((tag) => (
                    <Menu.Item key={tag.id}>{tag.name}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button
                className="w-100 text-start"
                style={{ color: "#878a99", height: 40 }}
              >
                <span style={{ width: "95%" }}>
                  {selectedTags[attribute.id]
                    ? attribute.tags.find(
                        (tag) => tag.id === selectedTags[attribute.id]
                      )?.name || "Select..."
                    : "Select..."}
                </span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </FormGroup>
        );
      }
      return null;
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mt-3">Add New Product</h4>
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
      </Container>
    </div>
  );
};

export default AddNewProduct;
