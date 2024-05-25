// Import necessary React and Reactstrap components
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
} from "reactstrap";
import ReactEditList, * as REL from "react-edit-list";
// import { preventDefault } from "@fullcalendar/core/internal";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import * as categoryService from "../../../service/categoryService";
import classnames from "classnames";
import { useDispatch } from "react-redux";

const AddCategoryModel = ({ isOpen, toggle, currentData }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [color, setColor] = useState("#000");
  const [allCategories, setAllCategories] = useState([]);
  const dispatch = useDispatch();
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    setSelectedParent("");
    setCategoryName("");
    setActiveTab("1");
  }, [toggle]);

  useEffect(() => {
    setCategoryList([]);
    // popUploader(dispatch, true);
    categoryService
      .getAllCategoriesWithOrWithoutSubCategories(false)
      .then((res) => {
        console.log(res.data);
        let temp = [];
        res.data.map((cat, index) => {
          temp.push(
            <option className="py-2" value={cat?.id}>
              {cat.name}
            </option>
          );
        });

        setCategoryList(temp);
        // popUploader(dispatch, false);
      })
      .catch((c) => {
        // popUploader(dispatch, false);
        // handleError(c);
      });
  }, [isOpen]);

  const handleSubmit = () => {
    let data = {
      name: categoryName,
      fileId: null,
    };

    categoryName.trim() === ""
      ? customToastMsg("Category name cannot be empty!", 0)
      : addCategory(data);
    //toggle();
  };

  const addCategory = (data) => {
    // popUploader(dispatch, true);
    categoryService
      .create(data)
      .then((res) => {
        customToastMsg("New Category added successfully !", 1);
        toggle();
        setCategoryName("");
        setActiveTab("1");
        // popUploader(dispatch, false);
      })
      .catch((c) => {
        console.log(c);
        // popUploader(dispatch, false);
        // c.response?.data.message
        //   ? customToastMsg(c.response.data.message, 0)
        //   : customToastMsg("Sorry! Try again later", 0);
      });
  };

  const addSubCategory = (data) => {
    console.log(data, "dataaaaa");
    // popUploader(dispatch, true);
    categoryService
      .create(data)
      .then((res) => {
        customToastMsg("Sub Category Successfully added !", 1);
        toggle();
        setCategoryName("");

        setActiveTab("1");
      })
      .catch((c) => {
        console.log(c);
        // popUploader(dispatch, false);
        // c.response?.data.message
        //   ? customToastMsg(c.response.data.message, 0)
        //   : customToastMsg("Sorry! Try again later", 0);
      });
  };
  const handleSubCategory = () => {
    let data = {
      name: categoryName,
      parentId: selectedParent,
    };

    selectedParent.trim() === ""
      ? customToastMsg("Select category for your new subcategory !", 0)
      : categoryName.trim() === ""
      ? customToastMsg("Category name cannot be empty!", 0)
      : addSubCategory(data);
    //toggle();
  };

  return (
    <Modal size="md" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Add New Category</ModalHeader>
      <ModalBody>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "1" })}
              onClick={() => {
                setCategoryName("");
                setSelectedParent("");
                toggleTab("1");
              }}
            >
              Add New Main Category
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "2" })}
              onClick={() => {
                setCategoryName("");
                setSelectedParent("");
                toggleTab("2");
              }}
            >
              Add New Subcategory
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col sm="12">
                <Form className="mt-2">
                  <FormGroup>
                    <Label for="categoryName">Category Name </Label>
                    <Input
                      type="text"
                      name="categoryName"
                      id="categoryName"
                      placeholder="Eg: T-Shirts"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="categoryName">Select image for category </Label>
                    <Row>
                      {/* <Col sm={12} md={8} lg={6}>
                        <SketchPicker
                          className={"w-100"}
                          color={color}
                          onChangeComplete={handleChangeComplete}
                        />
                      </Col> */}

                      <Col sm={12} md={4} lg={6} className="px-4 ">
                        <div
                          className="w-100 h-25 rounded-2"
                          style={{ background: color, height: "20px" }}
                        >
                          {" "}
                        </div>
                      </Col>
                    </Row>
                  </FormGroup>

                  <div className="d-flex justify-content-end">
                    <Button
                      className="mx-2"
                      outline
                      color="secondary"
                      onClick={toggle}
                    >
                      Cancel
                    </Button>{" "}
                    <Button color="primary" onClick={handleSubmit}>
                      Add New Category
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
                <Form className="mt-2">
                  <FormGroup>
                    <Label for="categoryName">Select main category name </Label>
                    <Input
                      className={"form-control"}
                      id="exampleSelect"
                      name="select"
                      type="select"
                      onChange={(e) => {
                        console.log(e.target.value);
                        setSelectedParent(e.target.value);
                      }}
                    >
                      <option value=" ">select a category</option>
                      {categoryList}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="categoryName">Subcategory Name</Label>
                    <Input
                      type="text"
                      name="categoryName"
                      id="categoryName"
                      placeholder="Eg: Polo "
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="categoryName">
                      Select image for subcategory{" "}
                    </Label>
                    <Row>
                      {/* <Col sm={12} md={8} lg={6}>
                        <SketchPicker
                          className={"w-100"}
                          color={color}
                          onChangeComplete={handleChangeComplete}
                        />
                      </Col> */}

                      <Col sm={12} md={4} lg={6} className="px-4 ">
                        <div
                          className="w-100 h-25 rounded-2"
                          style={{ background: color, height: "20px" }}
                        >
                          {" "}
                        </div>
                      </Col>
                    </Row>
                  </FormGroup>
                  <div className="d-flex justify-content-end">
                    <Button
                      className="mx-2"
                      outline
                      color="secondary"
                      onClick={toggle}
                    >
                      Cancel
                    </Button>{" "}
                    <Button color="primary" onClick={handleSubCategory}>
                      Add New Subcategory
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  );
};

export default AddCategoryModel;
