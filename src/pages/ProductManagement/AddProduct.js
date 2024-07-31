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
import {
  Button,
  message,
  Steps,
  theme,
  Dropdown,
  Menu,
  Select,
  Checkbox,
  Switch,
} from "antd";
import { getAllCategoriesWithOrWithoutSubCategories } from "../../service/categoryService";
import { getAllAttributesWithTags } from "../../service/attributeAndTagService";
import { ArrowLeft, Upload } from "react-feather";
import { useNavigate } from "react-router-dom";
import ProductVariantsFormRepeater from "../../Components/Common/formRepeters/ProductVariantsFormRepeater";
import FileUploadModal from "../../Components/Common/modal/FileUploadModal";
import * as productService from "../../service/productService";

const AddProduct = () => {
  document.title = "Add Product | Address Shop";

  const { Option } = Select;

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const history = useNavigate();

  const [productName, setProductName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [productDes, setProductDes] = useState("");
  const [manufactureDetails, setManufactureDetails] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [productVariantDetails, setProductVariantDetails] = useState([]);
  // const [productImages, setProductImages] = useState();
  const [imageUploadIndex, setImageUploadIndex] = useState(null);

  //---------------------data show --------------------------------------
  const [categoryList, setCategoryList] = useState([]);
  const [selectedProductCategoryName, setSelectedProductCategoryName] =
    useState("");
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");
  const [attributesAndTagList, setAttributesAndTagList] = useState([]);
  const [productColorDetails, setProductColorDetails] = useState([
    { attributeId: null, color: null, image: [], sizes: [] },
  ]);

  const [selectCheckBox, setSelectColorCheckBox] = useState(false);
  const [selectSizeCheckBox, setSelectSizeCheckBox] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  const openToggle = () => {
    setImageModalOpen(!imageModalOpen);
  };

  const loadAllCategoriesWithSubCategories = () => {
    setCategoryList([]);
    const withSubCategories = true;
    getAllCategoriesWithOrWithoutSubCategories(withSubCategories)
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
        newTags.push(tagId);
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
        {selectCheckBox && (
          <FormGroup className="col-3">
            <Label>Color</Label>
            <Select
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
        )}
        <FormGroup className="col-3">
          <Label>Image</Label>
          <button
            className={"mt-2 clickToUploadButton w-100"}
            type="button"
            onClick={() => {
              setImageUploadIndex(colorIndex); // Set the index before opening the modal
              openToggle();
              console.log(colorIndex, "color index++++++++++");
            }}
          >
            <Upload className={"upload_icon"} size={15} />
            Click To Upload
          </button>
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

        <FormGroup className="col-5">
          {detail.image && detail.image.length > 0 && (
            <div className="d-flex my-2 flex-wrap">
              {detail.image.map((img, idx) => (
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
                    (e.target.src = "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                  }
                />
              ))}
            </div>
          )}
        </FormGroup>
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

  const handleImageChange = (files, index) => {
    console.log(files, ".................");
    const newColorDetails = [...productColorDetails];
    newColorDetails[index].image = files;
    setProductColorDetails(newColorDetails);
  };

  const addColorForm = () => {
    let temp = { attributeId: null, color: null, image: [], sizes: [] };
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

  const getAttributeIds = (name, isHave) => {
    attributesAndTagList.forEach((attribute) => {
      if (attribute.name === name && attribute.isDefault) {
        setSelectedAttributes((prevSelectedAttributes) => {
          if (isHave) {
            // Add attribute ID if it is not already in the list
            if (!prevSelectedAttributes.includes(attribute.id)) {
              return [...prevSelectedAttributes, attribute.id];
            }
          } else {
            // Remove attribute ID if it is in the list
            return prevSelectedAttributes.filter((id) => id !== attribute.id);
          }
          return prevSelectedAttributes;
        });
      }
    });
  };

  const validationProductDetails = () => {
    let validate = false;
    selectedCategoryId.trim() === ""
      ? customToastMsg("Select product category first", 2)
      : productName.trim() === ""
      ? customToastMsg("Product name cannot be empty", 2)
      : // : productDes.trim() === ""
      // ? customToastMsg("Product description cannot be empty", 2)
      // : countDescription(productDes) > desMaxLimit
      // ? customToastMsg("Product description limit exceed", 2)
      manufactureDetails.trim() === ""
      ? customToastMsg("Manufacture details cannot be empty", 2)
      : countDescription(manufactureDetails) > desMaxLimit
      ? customToastMsg("Manufacture details limit exceed", 2)
      : // : selectedTags.length === 0
        // ? customToastMsg("Select product attributes", 2)
        (validate = true);

    if (validate) {
      productService
        .checkProductNameExists(productName)
        .then((res) => {
          next();
        })
        .catch((err) => {
          handleError(err);
        });
    }
  };

  const handleCreateProduct = async () => {
    let validation = false;

    // for (const variant of productVariantDetails) {
    //   // Check if name, sellingPrice, or availableQty is empty or null
    //   if (
    //     !variant.name ||
    //     variant.variants.some(
    //       (variantDetail) =>
    //         !variantDetail.sellingPrice || !variantDetail.availableQty
    //     )
    //   ) {
    //     validation = false;
    //     break; // Exit loop early if any variant has invalid data
    //   }
    // }

    selectedCategoryId.trim() === ""
      ? customToastMsg("Select product category", 2)
      : productName.trim() === ""
      ? customToastMsg("Product name cannot be empty", 2)
      : // : productDes.trim() === ""
      // ? customToastMsg("Product description cannot be empty", 2)
      // : countDescription(productDes) > desMaxLimit
      // ? customToastMsg("Product description limit exceed", 2)
      manufactureDetails.trim() === ""
      ? customToastMsg("Manufacture details cannot be empty", 2)
      : countDescription(manufactureDetails) > desMaxLimit
      ? customToastMsg("Manufacture details limit exceed", 2)
      : // : selectedTags.length === 0
      // ? customToastMsg("Select product attributes", 2)
      productVariantDetails.length === 0
      ? customToastMsg("Select product variant details", 2)
      : // : !validation
        // ? customToastMsg("Product variant details cannot have empty values", 2)
        (validation = true);

    if (validation) {
      const data = {
        name: productName,
        // description: productDes,
        manufactureDetails: manufactureDetails,
        categoryId: selectedCategoryId,
        productTagIds: selectedTags,
        productAttributeIds: selectedAttributes,
        productVariants: productVariantDetails,
      };

      console.log(data);
      await productService
        .addNewProduct(data)
        .then((res) => {
          console.log(res);
          customToastMsg("Product saved successfully", 1);
          clearProductFields();
          history("/product-management");
        })
        .catch((err) => {
          handleError(err);
        });
    }
  };

  const clearProductFields = () => {
    setProductName("");
    setSelectedCategoryId("");
    setProductDes("");
    setManufactureDetails("");
    setSelectedTags([]);
    setSelectedAttributes([]);
    setProductVariantDetails([]);
    setImageUploadIndex(null);
    setSelectedProductCategoryName("");
    setSelectedSubCategoryName("");
    setAttributesAndTagList([]);
    setProductColorDetails([
      { attributeId: null, color: null, image: [], sizes: [] },
    ]);
  };

  const steps = [
    {
      title: "Product Details",
      content: (
        <div className="mt-4">
          {" "}
          <Card>
            <CardHeader>
              <h6>Basic Information</h6>
            </CardHeader>
            <CardBody>
              <Row>
                <FormGroup className="col-6 d-flex flex-column">
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
                <FormGroup className="col-6">
                  <Label for="productName">Product Name</Label>
                  <Input
                    type="text"
                    name="productName"
                    id="productName"
                    placeholder="Eg: StitchSensei Polo T-Shirt"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </FormGroup>
              </Row>
              <Row>
                {/* <FormGroup className="col-6">
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
                </FormGroup> */}
                <FormGroup className="col-12">
                  <div>
                    <div className="d-flex justify-content-between">
                      <Label>Manufacture Details</Label>
                      {countDescription(manufactureDetails) > desMaxLimit ? (
                        <span className="text-count text-danger">
                          {countDescription(manufactureDetails)} of{" "}
                          {desMaxLimit} Characters
                        </span>
                      ) : (
                        <span className="text-count text-muted">
                          {countDescription(manufactureDetails)} of{" "}
                          {desMaxLimit} Characters
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
          <Row className="d-flex justify-content-end">
            <div className="text-end mb-3" style={{ width: 300 }}>
              <button
                type="button"
                onClick={() => validationProductDetails()}
                className="w-100 btn btn-primary w-sm"
              >
                Next
              </button>
            </div>
          </Row>
        </div>
      ),
    },
    {
      title: "Variants, Price, Stock",
      content: (
        <div className="mt-4">
          {" "}
          <Card>
            <CardHeader>
              <div>
                <Switch
                  checkedChildren="Have Colors"
                  unCheckedChildren="No Colors"
                  defaultChecked={selectCheckBox}
                  onChange={(e) => {
                    console.log(e);
                    setSelectColorCheckBox(e);
                    getAttributeIds("Color", e);
                  }}
                />
                <Switch
                  className="mx-3"
                  checkedChildren="Have Sizes"
                  unCheckedChildren="No Sizes"
                  defaultChecked={selectSizeCheckBox}
                  onChange={(e) => {
                    setSelectSizeCheckBox(e);
                    getAttributeIds("Size", e);
                  }}
                />
              </div>
            </CardHeader>

            <CardBody>
              <Row className="mx-1 my-1 pt-1">{renderColorForms()}</Row>
            </CardBody>
          </Card>
          <Row>
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
          </Row>
          <Row className="d-flex justify-content-between">
            <div className="text-end mb-3  col-1">
              <button
                type="button"
                onClick={() => prev()}
                className="w-100 btn btn-primary w-sm"
              >
                Previous
              </button>
            </div>
            <div className="col-11 d-flex justify-content-end">
              <div className="text-end mb-3  col-2 mx-4">
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
              <div className="text-end mb-3 col-3">
                <button
                  type="button"
                  onClick={() => handleCreateProduct()}
                  className="w-100 btn btn-primary w-sm"
                >
                  Save Product
                </button>
              </div>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  return (
    <div className="page-content">
      <FileUploadModal
        isOpen={imageModalOpen}
        toggle={openToggle}
        isMultiple={true}
        uploadLimit={4}
        onFileUploadSuccess={(files) => {
          console.log(files, "00000+++++++++++++++++++++++++++++++++000000000");
          handleImageChange(files, imageUploadIndex); // Use the correct index here
        }}
      />
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
      <Steps className="mt-4 px-5" current={current} items={items} />
      <div className="">{steps[current].content}</div>
    </div>
  );
};

export default AddProduct;
