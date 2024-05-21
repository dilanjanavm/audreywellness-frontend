import React, { useState } from "react";
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
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { desMaxLimit } from "../../common/util";
import { countDescription } from "../../common/commonFunctions";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space } from "antd";

const AddNewProduct = () => {
  const [productName, setProductName] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [productDes, setProductDes] = useState("");
  const [manufactureDetails, setManufactureDetails] = useState("");

  const items = [
    {
      key: "2",
      label: "sub menu 1",
      children: [
        {
          key: "2-1",
          label: "3rd menu item",
        },
        {
          key: "2-2",
          label: "4th menu item",
        },
      ],
    },
    {
      key: "2",
      label: "sub menu 2",
    },
    {
      key: "2",
      label: "sub menu 3",
      children: [
        {
          key: "2-1",
          label: "3rd menu item",
        },
        {
          key: "2-2",
          label: "4th menu item",
        },
      ],
    },
  ];

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
                <Label for="productCategory">Select Product Category </Label>
                {/* <Select
                  id="productCategory"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable
                  value={
                    categoryList.find(
                      (option) => option.value === selectedProductCategory
                    ) || null
                  }
                  onChange={(e) => {
                    setSelectedProductCategory(
                      e?.value === undefined ? "" : e.value
                    );
                  }}
                  options={categoryList}
                /> */}

                <Dropdown
                  menu={{
                    items,
                  }}
                >
                  <a onClick={(e) => e.preventDefault()}>
                    <Button
                      className="w-100 text-start "
                      style={{ color: "#878a99", height: 40 }}
                    >
                      <span style={{ width: "95%" }}>Select...</span>
                      <DownOutlined />
                    </Button>
                  </a>
                </Dropdown>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup className="col-6">
                <div>
                  <div className="d-flex justify-content-between">
                    {" "}
                    <Label>Product Description</Label>
                    {countDescription(productDes) > desMaxLimit ? (
                      <span class="text-count  text-danger">
                        {countDescription(productDes)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    ) : (
                      <span class="text-count text-muted">
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
                    {" "}
                    <Label>Manufacture Details</Label>
                    {countDescription(manufactureDetails) > desMaxLimit ? (
                      <span class="text-count  text-danger">
                        {countDescription(manufactureDetails)} of {desMaxLimit}{" "}
                        Characters
                      </span>
                    ) : (
                      <span class="text-count text-muted">
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
      </Container>
    </div>
  );
};

export default AddNewProduct;
