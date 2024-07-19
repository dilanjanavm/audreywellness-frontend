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
import FileUploadModal from "./FileUploadModal";
import { Upload } from "react-feather";

const AddCategoryModel = ({ isOpen, toggle }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [color, setColor] = useState("#000");
  const [allCategories, setAllCategories] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState([]);

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
    categoryName.trim() === ""
      ? customToastMsg("Category name cannot be empty!")
      : uploadedFile.length === 0
      ? customToastMsg("Select image")
      : addCategory();
  };

  const addCategory = () => {
    // popUploader(dispatch, true);

    let temp = "";
    uploadedFile.length === 1
      ? uploadedFile.map((img) => {
          temp = img.id;
        })
      : (temp = "");

    let data = {
      name: categoryName,
      fileId: temp,
    };

    categoryService
      .create(data)
      .then((res) => {
        customToastMsg("New Category added successfully !", 1);
        toggle();
        setCategoryName("");
        setActiveTab("1");
        setUploadedFile([]);
        // popUploader(dispatch, false);
      })
      .catch((c) => {
        console.log(c);
        handleError(c);
        // popUploader(dispatch, false);
      });
  };

  const handleSubCategory = () => {
    selectedParent.trim() === ""
      ? customToastMsg("Select category for your new subcategory !")
      : categoryName.trim() === ""
      ? customToastMsg("Category name cannot be empty!")
      : uploadedFile.length === 0
      ? customToastMsg("Select image")
      : addSubCategory();
  };

  const addSubCategory = () => {
    // popUploader(dispatch, true);

    let temp = "";
    uploadedFile.length === 1
      ? uploadedFile.map((img) => {
          temp = img.id;
        })
      : (temp = "");

    let data = {
      name: categoryName,
      parentId: selectedParent,
      fileId: temp,
    };

    categoryService
      .create(data)
      .then((res) => {
        customToastMsg("Sub Category Successfully added !", 1);
        toggle();
        setCategoryName("");
        setSelectedParent("");
        setActiveTab("1");
        setUploadedFile([]);
      })
      .catch((c) => {
        console.log(c);
        handleError(c);
        // popUploader(dispatch, false);
      });
  };

  const openToggle = () => {
    setImageModalOpen(!imageModalOpen);
  };
  return (
    <Modal
      size="md"
      isOpen={isOpen}
      toggle={() => {
        toggle();
        setCategoryName("");
        setSelectedParent("");
        setActiveTab("1");
        setUploadedFile([]);
      }}
    >
      <FileUploadModal
        isOpen={imageModalOpen}
        toggle={openToggle}
        isMultiple={false}
        uploadLimit={1}
        onFileUploadSuccess={(files) => {
          setUploadedFile(files);
        }}
      />
      <ModalHeader
        toggle={() => {
          toggle();
          setCategoryName("");
          setSelectedParent("");
          setActiveTab("1");
          setUploadedFile([]);
        }}
      >
        Add New Category
      </ModalHeader>
      <ModalBody>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "1" })}
              onClick={() => {
                setCategoryName("");
                setSelectedParent("");
                toggleTab("1");
                setUploadedFile([]);
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
                setUploadedFile([]);
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
                    {/* <Label for="categoryName">Select image for category </Label> */}

                    <button
                      className={"mt-2 clickToUploadButton w-100"}
                      type="button"
                      onClick={openToggle}
                    >
                      <Upload className={"upload_icon"} size={15} />
                      Click To Upload
                    </button>
                  </FormGroup>
                  <FormGroup className="col-5">
                    {uploadedFile && uploadedFile.length > 0 && (
                      <div className="d-flex my-2 flex-wrap">
                        {uploadedFile.map((img, idx) => (
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
                              (e.target.src =
                                "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                            }
                          />
                        ))}
                      </div>
                    )}
                  </FormGroup>

                  <div className="d-flex justify-content-end">
                    <Button
                      className="m-2"
                      outline
                      color="secondary"
                      onClick={() => {
                        toggle();
                        setCategoryName("");
                        setSelectedParent("");
                        setActiveTab("1");
                        setUploadedFile([]);
                      }}
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
                    {/* <Label for="categoryName">
                      Select image for subcategory{" "}
                    </Label> */}

                    <button
                      className={"mt-2 clickToUploadButton w-100"}
                      type="button"
                      onClick={openToggle}
                    >
                      <Upload className={"upload_icon"} size={15} />
                      Click To Upload
                    </button>
                  </FormGroup>
                  <FormGroup className="col-5">
                    {uploadedFile && uploadedFile.length > 0 && (
                      <div className="d-flex my-2 flex-wrap">
                        {uploadedFile.map((img, idx) => (
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
                              (e.target.src =
                                "https://i.ibb.co/qpB9ZCZ/placeholder.png")
                            }
                          />
                        ))}
                      </div>
                    )}
                  </FormGroup>
                  <div className="d-flex justify-content-end">
                    <Button
                      className="m-2"
                      outline
                      color="secondary"
                      onClick={() => {
                        toggle();
                        setCategoryName("");
                        setSelectedParent("");
                        setActiveTab("1");
                        setUploadedFile([]);
                      }}
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
