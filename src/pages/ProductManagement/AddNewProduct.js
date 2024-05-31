import React, { useEffect, useRef, useState } from "react";
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
import { Button, Divider, Dropdown, Menu, Select, Checkbox } from "antd";
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
  const [productColorDetails, setProductColorDetails] = useState([
    { attributeId: null, color: null, image: null, sizes: [] },
  ]);

  const [selectCheckBox, setSelectColorCheckBox] = useState(true);
  const [selectSizeCheckBox, setSelectSizeCheckBox] = useState(true);

  const [removeColor, setRemoveColor] = useState({});

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
    loadAllAttributesWithTags();
  }, []);

  useEffect(() => {
    console.log(selectedTags, "selectedTags");
  }, [selectedTags]);

  useEffect(() => {
    if (!selectCheckBox) {
      setProductColorDetails([
        { attributeId: null, color: null, image: null, sizes: [] },
      ]);
    }
  }, [selectCheckBox]);

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

  const renderColorForms = () => {
    return productColorDetails.map((detail, colorIndex) => (
      <Row key={colorIndex} className="align-items-center">
        {
          <FormGroup className="col-3">
            <Label>Color</Label>
            <Select
              allowClear
              showSearch
              placeholder="Select..."
              style={{ width: "100%", height: 40 }}
              value={detail.color?.id || undefined}
              onChange={(value) => handleColorChange(value, colorIndex)}
            >
              {attributesAndTagList
                .find((attribute) => attribute.name === "Color")
                ?.tags.map((tag) => (
                  <Select.Option
                    key={tag.id}
                    value={tag.id}
                    disabled={productColorDetails
                      .map((detail) => detail.color?.id)
                      .includes(tag.id)}
                  >
                    {tag.name}
                  </Select.Option>
                ))}
            </Select>
          </FormGroup>
        }
        <FormGroup className="col-3">
          <Label>Image</Label>
          <Input
            type="file"
            onChange={(e) => handleImageChange(e, colorIndex)}
          />
        </FormGroup>
        {colorIndex < productColorDetails.length - 1 && (
          <Button
            className="col-1"
            type="danger"
            onClick={() => removeColorForm(colorIndex)}
          >
            Delete
          </Button>
        )}
      </Row>
    ));
  };

  useEffect(() => {
    console.log(productColorDetails, "colors");
  }, [productColorDetails]);

  const handleColorChange = (value, index) => {
    const newColorDetails = [...productColorDetails];
    const colorAttribute = attributesAndTagList.find(
      (attribute) => attribute.name === "Color"
    );

    if (colorAttribute) {
      const selectedColorTag = colorAttribute.tags.find(
        (tag) => tag.id === value
      );
      newColorDetails[index].attributeId = colorAttribute.id;

      if (selectedColorTag) {
        newColorDetails[index].color = {
          id: value,
          name: selectedColorTag.name,
        };
      }
    }

    setProductColorDetails(newColorDetails);

    if (value && index === productColorDetails.length - 1) {
      addColorForm();
    }
  };

  const handleImageChange = (e, index) => {
    const newColorDetails = [...productColorDetails];
    newColorDetails[index].image = e.target.files[0];
    setProductColorDetails(newColorDetails);
  };

  const addColorForm = () => {
    let temp = { attributeId: null, color: null, image: null, sizes: [] };
    setProductColorDetails([...productColorDetails, temp]);
  };

  // const removeColorForm = (index) => {
  //   const newColorDetails = [...productColorDetails];
  //   newColorDetails.splice(index, 1);
  //   setProductColorDetails(newColorDetails);
  // };

  const removeColorForm = (index) => {
    const newColorDetails = [...productColorDetails];
    const removedColor = newColorDetails.splice(index, 1)[0]; // Get the removed color object
    setProductColorDetails(newColorDetails);
    console.log(removedColor);
    setRemoveColor(removedColor?.color);
  };

  const handleCreateProduct = () => {
    let validation = false;

    // Validate product variant details
    const isVariantValid = (variant) => {
      return (
        variant.color &&
        variant.name &&
        variant.sizes.every((size) => size.size && size.qty && size.price)
      );
    };

    const hasInvalidValues = (obj) => {
      for (let key in obj) {
        if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
          return true;
        }
      }
      return false;
    };

    const filteredList = productVariantDetails.filter(isVariantValid);

    const invalidVariant = productVariantDetails.find(hasInvalidValues);

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
      : invalidVariant
      ? customToastMsg(
          "Product variant details cannot have undefined, null or empty values",
          2
        )
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
          <h4>Add New Product Two</h4>
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
          <Row>
            <Col lg={6} md={6} sm={6} className="mt-2 ">
              <Checkbox
                className="mx-4"
                defaultChecked={selectCheckBox}
                onChange={(e) => {
                  setSelectColorCheckBox(e.target.checked);
                }}
              >
                Color
              </Checkbox>
            </Col>
            <Col lg={6} md={6} sm={6} className="mt-2">
              <Checkbox
                defaultChecked={selectSizeCheckBox}
                onChange={(e) => {
                  setSelectSizeCheckBox(e.target.checked);
                }}
              >
                Size
              </Checkbox>
            </Col>
          </Row>
          <CardBody>
            <Row className="border rounded mx-1 my-1 pt-2">
              {selectCheckBox ? (
                renderColorForms()
              ) : (
                <FormGroup className="col-3">
                  <Label>Image</Label>
                  <Input
                    type="file"
                    onChange={(e) => handleImageChange(e, colorIndex)}
                  />
                </FormGroup>
              )}
            </Row>
            <ProductVariantsFormRepeater
              removeColor={removeColor}
              getProductVariantData={(data) => {
                console.log(data, "in main class");
                setProductVariantDetails([]);
                setProductVariantDetails(data);
              }}
              variantTypes={productColorDetails}
              selectSize={selectSizeCheckBox}
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
