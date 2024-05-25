import React, { useEffect, useState } from "react";
import { Minus, Plus } from "react-feather";
import { Button, FormFeedback, Input, Row } from "reactstrap";
import { customToastMsg } from "../../../common/commonFunctions";
import { getAllAttributesWithTags } from "../../../service/attributeAndTagService";
import { Select } from "antd";

const { Option } = Select;

const ProductVariantsFormRepeater = ({
  getProductVariantData,
  variantTypes,
}) => {
  const [inputList, setInputList] = useState([
    {
      color: "",
      file: {},
      sizes: [],
    },
  ]);

  const [colorTagList, setColorTagList] = useState([]);
  const [sizeTagList, setSizeTagList] = useState([]);

  useEffect(() => {
    loadAllAttributesWithTags();
  }, []);

  useEffect(() => {
    if (variantTypes && variantTypes.length > 0) {
      const formattedItems = variantTypes.map((variant) => ({
        color: variant?.color,
        sizes: variant?.sizes.map((size) => ({
          size: size.size,
          qty: size.qty,
          price: size.price,
        })),
      }));

      setInputList(formattedItems);
    }
  }, [variantTypes]);

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
    list[index].sizes[sizeIndex][name] = value;
    setInputList(list);
  };

  const handleSelectChange = (selectedOption, index, type) => {
    const list = [...inputList];
    if (type === "color") {
      list[index][type] = selectedOption;
    } else if (type === "size") {
      const sizes = selectedOption.map((size) => ({
        size,
        qty: "",
        price: "",
      }));
      list[index].sizes = sizes;
    }
    setInputList(list);
  };

  const handleRemove = (index) => {
    setInputList((currentList) => currentList.filter((_, i) => i !== index));
  };

  const handleAddClick = () => {
    const isEmptyColor = inputList.some((input) => !input.color);
    const hasEmptyImage = inputList.some(
      (input) => !Object.keys(input.file).length
    );
    const isEmptySize = inputList.some((input) =>
      input.sizes.some((size) => !size.size)
    );
    const isEmptyPrice = inputList.some((input) =>
      input.sizes.some((size) => !size.price || size.price < 0)
    );
    const isEmptyQuantity = inputList.some((input) =>
      input.sizes.some((size) => !size.qty || size.qty < 0)
    );

    if (isEmptyColor && hasEmptyImage && isEmptySize && isEmptyQuantity) {
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
          file: {},
          sizes: [],
        },
      ]);
    }
  };

  const getVariantTypes = () => {
    console.log(inputList);
    const filteredList = inputList.filter(
      (variant) =>
        variant.color &&
        variant.sizes.every((size) => size.size && size.qty && size.price)
    );

    // const variants = filteredList.map((variant) => ({
    //   color: variant.color,
    //   sizes: variant.sizes.map((size) => ({
    //     size: size.size,
    //     qty: size.qty,
    //     price: size.price,
    //   })),
    // }));

    const variants = filteredList
      .map((variant) =>
        variant.sizes.map((size) => ({
          sellingPrice: size.price,
          availableQty: size.qty,
          fileId: "eb780d00-5988-4ff3-8289-a892c8381b3a", // replace this with actual file ID if available
          variantTagIds: [variant.color, size.size.id],
        }))
      )
      .flat();

    getProductVariantData(variants);
  };

  return (
    <div className="row">
      {inputList.map((variant, i) => (
        <div className="d-flex my-3" key={i}>
          <div className="row" style={{ width: "80%" }}>
            <div className="form-group col-md-2 col-lg-2">
              <label className="form-label">Color</label>
              <Select
                allowClear
                showSearch
                placeholder="Select..."
                style={{ width: "100%", height: 40 }}
                value={variant.color}
                onChange={(selectedOption) =>
                  handleSelectChange(selectedOption, i, "color")
                }
              >
                {colorTagList.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="form-group col-md-2 col-lg-2">
              <label className="form-label">Image</label>
              {/* Image input logic goes here */}
            </div>
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
            <div className="form-group col-md-5 col-lg-5">
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
          </div>
          <div className="d-flex mx-2" style={{ width: "fit-content" }}>
            {inputList.length !== 1 && (
              <div
                className="mt-4 p-0 pt-1 me-4"
                style={{ width: "fit-content" }}
              >
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemove(i)}
                >
                  <Minus size={18} /> Remove
                </button>
              </div>
            )}
            {inputList.length - 1 === i && (
              <div className="mt-4 p-0 pt-1" style={{ width: "fit-content" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddClick}
                >
                  <Plus size={18} /> New
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariantsFormRepeater;
