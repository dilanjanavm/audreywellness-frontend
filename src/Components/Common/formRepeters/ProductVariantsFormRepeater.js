import React, { useEffect, useState } from "react";
import { Minus, Plus } from "react-feather";
import { Button, Card, FormFeedback, Input, Row } from "reactstrap";
import { customToastMsg, handleError } from "../../../common/commonFunctions";
import { getAllAttributesWithTags } from "../../../service/attributeAndTagService";
import { Select } from "antd";

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
    // console.log(variantTypes, "color details");
    if (variantTypes && variantTypes.length > 0) {
      let formattedItems = [];
      let shouldClear = false;
      variantTypes.map((variant) => {
        if (variant?.attributeId != null) {
          shouldClear = true;

          if (selectSize) {
            console.log("attribute null neme , size true");
            formattedItems.push({
              color: variant?.color,
              files: variant?.image,
              name: variant?.name,
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
              files: variant?.image,
              name: variant?.name,
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
              files: [],
              name: "",
              sizes: [],
            });
          } else {
            console.log("attribute null neme , size false");
            formattedItems.push({
              color: "",
              files: [],
              name: "",
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
    const { name, value } = e.target;
    const list = [...inputList];
    name === "name"
      ? (list[index][name] = value)
      : (list[index].sizes[sizeIndex][name] = value);
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
          sizes: [],
        },
      ]);
    }
  };

  const getVariantTypes = () => {
    console.log(inputList);

    const variants = inputList.map((variant) => ({
      name: variant?.name,
      fileIds: variant?.files,
      baseTagId: variant.color?.id,
      variants: variant.sizes.map((size) => ({
        sellingPrice: size.price,
        availableQty: size.qty,
        variantTagId: size.size.id,
      })),
    }));

    getProductVariantData(variants);
  };

  return (
    <div className="row w-100">
      {inputList.map((variant, i) => (
        <Card className="d-flex my-3 mx-3 p-3" key={i}>
          <div className="row w-100">
            {variantTypes &&
            variantTypes.length === 1 &&
            variant?.color === "" ? (
              ""
            ) : (
              <div className="form-group col-md-2 col-lg-1">
                <label className="form-label">Color</label>
                <h6 className="fw-normal">{variant?.color?.name}</h6>
              </div>
            )}
            <div className="form-group col-md-2 col-lg-3">
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
              <div className="form-group col-md-3 col-lg-3">
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

            {selectSize ? (
              <div className="form-group col-md-12 col-lg-12 ">
                {variant.sizes.map((size, sizeIndex) => (
                  <Row
                    key={sizeIndex}
                    className="d-flex justify-content-end my-3"
                  >
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
            ) : (
              <div className="form-group col-md-6 col-lg-6 ">
                {variant.sizes.map((size, sizeIndex) => (
                  <Row key={sizeIndex}>
                    <div className="form-group col-md-6 col-lg-6">
                      <label className="form-label">
                        Quantity of {size.size.name}
                      </label>
                      <Input
                        type="text"
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
                    <div className="form-group col-md-6 col-lg-6">
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
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductVariantsFormRepeater;
