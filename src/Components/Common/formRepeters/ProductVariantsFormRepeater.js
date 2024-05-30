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
    console.log(variantTypes, "color details");
    if (variantTypes && variantTypes.length > 0) {
      let formattedItems = [];

      variantTypes.map((variant) => {
        if (variant?.attributeId != null && variant?.color != null) {
          formattedItems.push({
            color: variant?.color,
            name: variant?.name,
            sizes: variant?.sizes.map((size) => ({
              size: size.size,
              qty: size.qty,
              price: size.price,
            })),
          });
        }
      });

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
          nameL: "",
          sizes: [],
        },
      ]);
    }
  };

  const getVariantTypes = () => {
    console.log(inputList);

    const variants = inputList
      .map((variant) =>
        variant.sizes.map((size) => ({
          sellingPrice: size.price,
          availableQty: size.qty,
          name: variant?.name,
          variantTagIds: [variant.color?.id, size.size.id],
        }))
      )
      .flat();

    getProductVariantData(variants);
  };

  return (
    <div className="row">
      {inputList.map((variant, i) => (
        <div className="d-flex my-3" key={i}>
          <div className="row w-100">
            <div className="form-group col-md-2 col-lg-1">
              <label className="form-label">Color</label>
              <h6 className="fw-normal">{variant?.color?.name}</h6>
            </div>
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
        </div>
      ))}
    </div>
  );
};

export default ProductVariantsFormRepeater;
