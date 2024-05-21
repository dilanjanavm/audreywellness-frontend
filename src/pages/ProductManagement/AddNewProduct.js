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
import { Button, Dropdown, Space, Menu } from "antd";
import { getAllCategoriesWithSubCategories } from "../../service/categoryService";

const AddNewProduct = () => {
  const [productName, setProductName] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [productDes, setProductDes] = useState("");
  const [manufactureDetails, setManufactureDetails] = useState("");

  useEffect(() => {
    loadAllCategoriesWithSubCategories();
  }, []);

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

  const handleMenuClick = ({ key }) => {
    console.log(key);
    setSelectedProductCategory(key);
  };

  const renderMenu = (categories) => (
    <Menu onClick={handleMenuClick}>
      {categories.map((category) =>
        category.children ? (
          <Menu.SubMenu key={category.key} title={category.label}>
            {category.children.map((subCategory) => (
              <Menu.Item key={subCategory.key}>{subCategory.label}</Menu.Item>
            ))}
          </Menu.SubMenu>
        ) : (
          <Menu.Item key={category.key}>{category.label}</Menu.Item>
        )
      )}
    </Menu>
  );

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
              <FormGroup className="col-4 d-flex flex-column">
                <Label for="productCategory">Select Product Category</Label>
                <Dropdown overlay={renderMenu(categoryList)}>
                  <Button
                    className="w-100 text-start"
                    style={{ color: "#878a99", height: 40 }}
                  >
                    <span style={{ width: "95%" }}>
                      {selectedProductCategory
                        ? categoryList.find(
                            (cat) =>
                              cat.key === selectedProductCategory ||
                              cat.children?.some(
                                (sub) => sub.key === selectedProductCategory
                              )
                          )?.label || "Select..."
                        : "Select..."}
                    </span>
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
      </Container>
    </div>
  );
};

export default AddNewProduct;
