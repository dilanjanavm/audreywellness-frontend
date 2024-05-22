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
import { countDescription, handleError } from "../../common/commonFunctions";
import { DownOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Dropdown, Menu, Select, Table } from "antd";
import { getAllCategoriesWithSubCategories } from "../../service/categoryService";
import { getAllAttributesWithTags } from "../../service/attributeAndTagService";

const { Option } = Select;

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

  const [productColorDetails, setProductColorDetails] = useState([
    { attributeId: null, color: null, image: null, sizes: [] },
  ]);
  const [productSizeDetails, setProductSizeDetails] = useState([]); // State for product sizes
  const [productVariants, setProductVariants] = useState([]);

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
    loadAllAttributesWithTags();
  }, []);

  useEffect(() => {
    console.log(selectedTags, "selectedTags");
  }, [selectedTags]);
  useEffect(() => {
    console.log(productColorDetails, "color list");
  }, [productColorDetails]);
  useEffect(() => {
    console.log(productSizeDetails, "productSizeDetails list");
  }, [productSizeDetails]);

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
    setSelectedTags((prevSelectedTags) => ({
      ...prevSelectedTags,
      [attributeId]: tagId,
    }));
  };

  const clearSelection = (attributeId) => {
    setSelectedTags((prevSelectedTags) => {
      const newSelectedTags = { ...prevSelectedTags };
      delete newSelectedTags[attributeId];
      return newSelectedTags;
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
              value={selectedTags[attribute.id] || undefined}
              onChange={(value) =>
                value === undefined
                  ? clearSelection(attribute.id)
                  : handleTagSelection(attribute.id, value)
              }
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

  const handleColorChange = (value, index) => {
    const newColorDetails = [...productColorDetails];
    newColorDetails[index].color = value;
    setProductColorDetails(newColorDetails);

    const colorAttribute = attributesAndTagList.find(
      (attribute) => attribute.name === "Color"
    );
    if (colorAttribute) {
      newColorDetails[index].attributeId = colorAttribute.id;
    }

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

  const removeColorForm = (index) => {
    const newColorDetails = [...productColorDetails];
    newColorDetails.splice(index, 1);
    setProductColorDetails(newColorDetails);
  };

  const handleSizeChange = (attributeId, value) => {
    setProductSizeDetails((prevSizeDetails) => ({
      ...prevSizeDetails,
      [attributeId]: value,
    }));
  };

  const handlePriceChange = (colorIndex, sizeIndex, price) => {
    const updatedVariants = [...productVariants];
    if (!updatedVariants[colorIndex]) {
      updatedVariants[colorIndex] = {};
    }
    if (!updatedVariants[colorIndex][sizeIndex]) {
      updatedVariants[colorIndex][sizeIndex] = {};
    }
    updatedVariants[colorIndex][sizeIndex].price = price;
    setProductVariants(updatedVariants);
  };

  const handleQuantityChange = (colorIndex, sizeIndex, quantity) => {
    const updatedVariants = [...productVariants];
    if (!updatedVariants[colorIndex]) {
      updatedVariants[colorIndex] = {};
    }
    if (!updatedVariants[colorIndex][sizeIndex]) {
      updatedVariants[colorIndex][sizeIndex] = {};
    }
    updatedVariants[colorIndex][sizeIndex].quantity = quantity;
    setProductVariants(updatedVariants);
  };

  const renderColorForms = () => {
    return productColorDetails.map((detail, colorIndex) => (
      <Row key={colorIndex} className="align-items-center">
        <FormGroup className="col-3">
          <Label>Color</Label>
          <Select
            allowClear
            showSearch
            placeholder="Select..."
            style={{ width: "100%", height: 40 }}
            value={detail.color || undefined}
            onChange={(value) => handleColorChange(value, colorIndex)}
          >
            {attributesAndTagList
              .find((attribute) => attribute.name === "Color")
              ?.tags.map((tag) => (
                <Select.Option
                  key={tag.id}
                  value={tag.id}
                  disabled={productColorDetails
                    .map((detail) => detail.color)
                    .includes(tag.id)}
                >
                  {tag.name}
                </Select.Option>
              ))}
          </Select>
        </FormGroup>
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

  const getColorTagNameById = (tagId) => {
    const colorAttribute = attributesAndTagList.find(
      (attribute) => attribute.name === "Color"
    );
    if (colorAttribute) {
      const tag = colorAttribute.tags.find((tag) => tag.id === tagId);
      return tag ? tag.name : "";
    }
    return "";
  };

  const getSizeTagNameById = (tagId) => {
    const sizeAttribute = attributesAndTagList.find(
      (attribute) => attribute.name === "Size"
    );
    if (sizeAttribute) {
      const tag = sizeAttribute.tags.find((tag) => tag.id === tagId);
      return tag ? tag.name : "";
    }
    return "";
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
        <Card>
          <CardHeader>
            <h6>Variants, Price, Stock</h6>
          </CardHeader>
          <CardBody>
            <Row className="border rounded mx-1 my-1 pt-2">
              {renderColorForms()}
            </Row>
            <Row className="border rounded mx-1 my-1 mt-3 pt-2">
              {attributesAndTagList.map((attribute) => {
                if (attribute?.isDefault && attribute?.name === "Size") {
                  return (
                    <FormGroup className="col-3" key={attribute?.id}>
                      <Label>{attribute?.name}</Label>
                      <Select
                        mode="multiple"
                        allowClear
                        showSearch
                        placeholder="Select..."
                        style={{ width: "100%", height: 40 }}
                        value={productSizeDetails[attribute?.id] || []}
                        onChange={(value) =>
                          handleSizeChange(attribute?.id, value)
                        }
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
              })}
            </Row>

            <Row className="mx-1 my-2 border rounded py-3">
              <Row className="pb-2">
                <Col sm={3} md={3} lg={3} xl={3}>
                  <h6>Color</h6>
                </Col>
                <Col sm={3} md={3} lg={3} xl={3}>
                  <h6>Size</h6>
                </Col>

                <Col sm={3} md={3} lg={3} xl={3}>
                  <h6>Price</h6>
                </Col>

                <Col sm={3} md={3} lg={3} xl={3}>
                  <h6>Quantity</h6>
                </Col>
              </Row>
              <Divider />
              {productColorDetails.map((colorDetail, colorIndex) => {
                if (colorDetail?.color != null) {
                  const colorName = getColorTagNameById(colorDetail.color);
                  return (
                    <Row key={colorIndex}>
                      <Col sm={3} md={3} lg={3} xl={3}>
                        <p>{colorName}</p>
                      </Col>
                      <Col sm={3} md={3} lg={3} xl={3}>
                        {productSizeDetails[
                          attributesAndTagList.find(
                            (attr) => attr.name === "Size"
                          )?.id
                        ]?.map((sizeId, sizeIndex) => {
                          const sizeName = getSizeTagNameById(sizeId);
                          return <p key={sizeIndex}>{sizeName}</p>;
                        })}
                      </Col>
                      <Col sm={3} md={3} lg={3} xl={3}>
                        {productSizeDetails[
                          attributesAndTagList.find(
                            (attr) => attr.name === "Size"
                          )?.id
                        ]?.map((sizeId, sizeIndex) => (
                          <Input
                            key={sizeIndex}
                            type="number"
                            placeholder="Price"
                            className="my-2"
                            value={
                              productVariants[colorIndex]?.[sizeIndex]?.price ||
                              ""
                            }
                            onChange={(e) =>
                              handlePriceChange(
                                colorIndex,
                                sizeIndex,
                                e.target.value
                              )
                            }
                          />
                        ))}
                      </Col>
                      <Col sm={3} md={3} lg={3} xl={3}>
                        {productSizeDetails[
                          attributesAndTagList.find(
                            (attr) => attr.name === "Size"
                          )?.id
                        ]?.map((sizeId, sizeIndex) => (
                          <Input
                            key={sizeIndex}
                            type="number"
                            placeholder="Quantity"
                            className="my-2"
                            value={
                              productVariants[colorIndex]?.[sizeIndex]
                                ?.quantity || ""
                            }
                            onChange={(e) =>
                              handleQuantityChange(
                                colorIndex,
                                sizeIndex,
                                e.target.value
                              )
                            }
                          />
                        ))}
                      </Col>
                    </Row>
                  );
                }
              })}
            </Row>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default AddNewProduct;
