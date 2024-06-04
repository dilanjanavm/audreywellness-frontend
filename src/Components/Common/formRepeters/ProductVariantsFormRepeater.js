import React, { useEffect, useState } from "react";
import { Minus, Plus } from "react-feather";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import {
  countDescription,
  customToastMsg,
  handleError,
} from "../../../common/commonFunctions";
import { getAllAttributesWithTags } from "../../../service/attributeAndTagService";
import { Divider, Select } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { desMaxLimit } from "../../../common/util";
import "../../../assets/scss/components/productAdd.scss";

const { Option } = Select;

const ProductVariantsFormRepeater = ({
  removeColor,
  getProductVariantData,
  variantTypes,
  selectSize,
}) => {
  const [inputList, setInputList] = useState([
    {
      color: "",
      files: [],
      name: "",
      description: "",
      sizes: [],
    },
  ]);

  const [colorTagList, setColorTagList] = useState([]);
  const [sizeTagList, setSizeTagList] = useState([]);

  useEffect(() => {
    loadAllAttributesWithTags();
  }, []);

  useEffect(() => {
    // console.log(removeColor, "remove color");
    // console.log(selectSize, "select size");
    console.log(variantTypes, "color details");
    if (variantTypes && variantTypes.length > 0) {
      let formattedItems = [];
      let shouldClear = false;
      variantTypes.map((variant) => {
        if (variant?.attributeId != null) {
          shouldClear = true;

          const imageIds = variant?.image
            ? variant.image.map((img) => img.id)
            : [];

          if (selectSize) {
            console.log("attribute null neme , size true");
            formattedItems.push({
              color: variant?.color,
              files: imageIds,
              name: variant?.name,
              description: variant?.description ? variant?.description : "",
              sizes: variant?.sizes.map((size) => ({
                size: size.size,
                qty: size.qty,
                price: size.price,
              })),
            });
          } else {
            console.log("attribute null neme , size false");
            formattedItems.push({
              color: variant?.color,
              files: imageIds,
              name: variant?.name,
              description: variant?.description ? variant?.description : "",
              sizes: [
                {
                  size: "",
                  qty: "",
                  price: "",
                },
              ],
            });
          }
        } else {
          console.log("attribute null , size true");
          if (selectSize) {
            formattedItems.push({
              color: "",
              files: variant?.image ? variant.image.map((img) => img.id) : [],
              name: "",
              description: "",
              sizes: [],
            });
          } else {
            console.log("attribute null neme , size false");
            formattedItems.push({
              color: "",
              files: variant?.image ? variant.image.map((img) => img.id) : [],
              name: "",
              description: "",
              sizes: [{ size: "", qty: "", price: "" }],
            });
          }
        }
      });

      if (shouldClear) {
        formattedItems = formattedItems.filter((item) => item.color !== "");
      }

      setInputList(formattedItems);
    }
  }, [variantTypes, selectSize]);

  useEffect(() => {
    console.log(inputList, "input list");
  }, [inputList]);

  useEffect(() => {
    getVariantTypes();
  }, [inputList]);

  const loadAllAttributesWithTags = () => {
    setColorTagList([]);
    getAllAttributesWithTags()
      .then((res) => {
        res?.data.forEach((attribute) => {
          if (attribute?.isDefault && attribute?.name === "Color") {
            setColorTagList(attribute?.tags);
          }
          if (attribute?.isDefault && attribute?.name === "Size") {
            setSizeTagList(attribute?.tags);
          }
        });
      })
      .catch((err) => {
        handleError(err);
      });
  };

  const handleInputChange = (e, index, sizeIndex) => {
    console.log(e, index, sizeIndex);
    const { name, value } = e.target;
    const list = [...inputList];
    name === "name"
      ? (list[index][name] = value)
      : (list[index].sizes[sizeIndex][name] = value);
    setInputList(list);
  };

  const handleDesChange = (data, index) => {
    const list = [...inputList];
    list[index].description = data;
    setInputList(list);
  };

  const handleSelectChange = (selectedOption, index, type) => {
    const list = [...inputList];
    if (type === "size") {
      const sizes = selectedOption.map((size) => ({
        size,
        qty: "",
        price: "",
      }));
      list[index].sizes = sizes;

      setInputList(list);
    }
  };

  const handleRemove = (index) => {
    setInputList((currentList) => currentList.filter((_, i) => i !== index));
  };

  const handleAddClick = () => {
    const isEmptyColor = inputList.some((input) => !input.color);

    const isEmptySize = inputList.some((input) =>
      input.sizes.some((size) => !size.size)
    );
    const isEmptyPrice = inputList.some((input) =>
      input.sizes.some((size) => !size.price || size.price < 0)
    );
    const isEmptyQuantity = inputList.some((input) =>
      input.sizes.some((size) => !size.qty || size.qty < 0)
    );

    if (isEmptyColor && isEmptySize && isEmptyQuantity) {
      customToastMsg("Select variant details");
    } else if (isEmptyColor) customToastMsg("Select variant color");
    else if (isEmptySize) customToastMsg("Select variant size");
    else if (isEmptyQuantity) customToastMsg("Enter valid variant quantity");
    else if (isEmptyPrice) customToastMsg("Enter valid variant price");
    else {
      setInputList([
        ...inputList,
        {
          color: "",
          files: [],
          name: "",
          description: "",
          sizes: [],
        },
      ]);
    }
  };

  const getVariantTypes = () => {
    console.log(inputList);

    const variants = inputList.map((variant) => ({
      name: variant?.name,
      description: variant?.description,
      fileIds: variant?.files,
      baseTagId: variant.color?.id,
      variants: variant.sizes.map((size) => ({
        sellingPrice: parseFloat(size.price),
        availableQty: parseFloat(size.qty),
        variantTagId: size.size.id,
      })),
    }));

    getProductVariantData(variants);
  };

  return (
    <div className="row w-100 ">
      {inputList.map((variant, i) => (
        <Card className="d-flex mx-3 py-3" key={i}>
          {variantTypes &&
          variantTypes.length === 1 &&
          variant?.color === "" ? (
            ""
          ) : (
            <CardHeader className="pt-0 pb-2 px-1">
              <h5>{variant?.color?.name} Color</h5>
            </CardHeader>
          )}

          <CardBody className="row w-100">
            <Row>
              <Col sm={6}>
                <div className="form-group col-12">
                  <label className="form-label">Name</label>
                  <Input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter name"
                    value={variant.name != undefined ? variant.name : ""}
                    onChange={(e) => handleInputChange(e, i, name)}
                  />
                </div>

                {variantTypes &&
                variantTypes.length === 1 &&
                variant?.color === "" &&
                !selectSize ? (
                  ""
                ) : variantTypes && variantTypes.length > 0 && selectSize ? (
                  <div className="form-group col-12 my-3">
                    <label className="form-label">Size</label>
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      placeholder="Select..."
                      style={{ width: "100%", height: 40 }}
                      value={variant.sizes.map((s) => s.size.id)}
                      onChange={(selectedOption) =>
                        handleSelectChange(
                          sizeTagList.filter((tag) =>
                            selectedOption.includes(tag.id)
                          ),
                          i,
                          "size"
                        )
                      }
                    >
                      {sizeTagList.map((tag) => (
                        <Option key={tag.id} value={tag.id}>
                          {tag.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  ""
                )}

                {!selectSize && (
                  <div className="col-md-6 col-lg-12 my-3">
                    {variant.sizes.map((size, sizeIndex) => (
                      <Row key={sizeIndex}>
                        <div className="form-group col-6">
                          <label className="form-label">
                            Quantity of {size.size.name}
                          </label>
                          <Input
                            type="number"
                            name="qty"
                            className="form-control"
                            placeholder="Enter quantity"
                            value={size.qty}
                            onChange={(e) => handleInputChange(e, i, sizeIndex)}
                            invalid={size.qty < 0}
                          />
                          {size.qty < 0 && (
                            <FormFeedback>Invalid Quantity</FormFeedback>
                          )}
                        </div>
                        <div className="form-group col-6">
                          <label className="form-label">
                            Price of {size.size.name}
                          </label>
                          <Input
                            type="number"
                            name="price"
                            className="form-control"
                            placeholder="Enter price"
                            value={size.price}
                            onChange={(e) => handleInputChange(e, i, sizeIndex)}
                            invalid={size.price < 0}
                          />
                          {size.price < 0 && (
                            <FormFeedback>Invalid Price</FormFeedback>
                          )}
                        </div>
                      </Row>
                    ))}
                  </div>
                )}
              </Col>
              <Col sm={6}>
                <div>
                  <div className="d-flex justify-content-between">
                    <Label>Description</Label>
                    {countDescription(variant.description) > desMaxLimit ? (
                      <span className="text-count text-danger">
                        {countDescription(variant.description)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    ) : (
                      <span className="text-count text-muted">
                        {countDescription(variant.description)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    )}
                  </div>
                  <CKEditor
                    className="custom-ckeditor"
                    name="description"
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      handleDesChange(data, i);
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
                    data={variant.description}
                    onReady={(editor) => {}}
                  />
                </div>
              </Col>
            </Row>

            {selectSize && (
              <div className="mt-2">
                <div className="form-group col-md-12 col-lg-12 ">
                  {variant.sizes.length > 0 && (
                    <>
                      <Divider orientation="left">Size details</Divider>
                      <Row>
                        <Col sm={1}>
                          <h6>Size</h6>
                        </Col>
                        <Col sm={4}>
                          <h6>Quantity</h6>
                        </Col>
                        <Col sm={4}>
                          <h6>Price</h6>
                        </Col>
                      </Row>
                    </>
                  )}

                  {variant.sizes.map((size, sizeIndex) => (
                    <Row key={sizeIndex} className="d-flex my-3">
                      <div className="form-group col-md-1 col-lg-1 d-flex align-items-center">
                        {/* <label className="form-label">Size</label> */}
                        <h6 className="fw-normal">{size.size.name}</h6>
                      </div>
                      <div className="form-group col-md-4 col-lg-4">
                        {/* <label className="form-label">
                      Quantity of {size.size.name}
                    </label> */}
                        <Input
                          type="number"
                          name="qty"
                          className="form-control"
                          placeholder="Enter quantity"
                          value={size.qty}
                          onChange={(e) => handleInputChange(e, i, sizeIndex)}
                          invalid={size.qty < 0}
                        />
                        {size.qty < 0 && (
                          <FormFeedback>Invalid Quantity</FormFeedback>
                        )}
                      </div>
                      <div className="form-group col-md-4 col-lg-4">
                        {/* <label className="form-label">
                      Price of {size.size.name}
                    </label> */}
                        <Input
                          type="number"
                          name="price"
                          className="form-control"
                          placeholder="Enter price"
                          value={size.price}
                          onChange={(e) => handleInputChange(e, i, sizeIndex)}
                          invalid={size.price < 0}
                        />
                        {size.price < 0 && (
                          <FormFeedback>Invalid Price</FormFeedback>
                        )}
                      </div>
                    </Row>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default ProductVariantsFormRepeater;
