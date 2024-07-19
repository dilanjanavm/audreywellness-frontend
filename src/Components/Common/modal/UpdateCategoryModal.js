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
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import * as categoryService from "../../../service/categoryService";
import classnames from "classnames";
import FileUploadModal from "./FileUploadModal";
import { Upload } from "react-feather";
import { useDispatch } from "react-redux";

const UpdateCategory = ({ isOpen, toggle, currentData }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [activeTab, setActiveTab] = useState("2");
  const [uploadedFile, setUploadedFile] = useState({});
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [allCategories, setAllCategories] = useState([]);

  const dispatch = useDispatch();

  const setCurrentData = () => {
    //currentData

    setCategoryName(currentData.name);
    setSelectedParent(currentData.parent_id);
    // setUploadedFile(currentData?.file);
  };

  useEffect(() => {
    getAllCategoriesWithOrWithoutSubCat();
  }, [isOpen]);

  const getAllCategoriesWithOrWithoutSubCat = () => {
    popUploader(dispatch, true);
    setCurrentData();
    console.log(currentData);
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
        popUploader(dispatch, false);
      })
      .catch((c) => {
        popUploader(dispatch, false);
        handleError(c);
      });
  };

  const openToggle = () => {
    setImageModalOpen(!imageModalOpen);
  };

  const handleSubCategory = () => {
    let isValidated = false;

    categoryName.trim() === ""
      ? customToastMsg("Category name cannot be empty!")
      : // : uploadedFile.length === 0
        // ? customToastMsg("Select image")
        (isValidated = true);

    let temp = "";
    uploadedFile.length === 1
      ? uploadedFile.map((img) => {
          temp = img.id;
        })
      : (temp = "");

    let data = {
      name: categoryName,
      parent_id: selectedParent,
      fileId: Object.keys(uploadedFile).length === 0 ? currentData?.file : temp,
    };

    if (isValidated) {
      customSweetAlert("Are you sure to update this?", 2, () => {
        popUploader(dispatch, true);
        categoryService
          .updateCategory(currentData.id, data)
          .then((res) => {
            customToastMsg("Category updated successfully !", 1);
            toggle();
            setCategoryName("");
            setSelectedParent("");
            setUploadedFile([]);
            popUploader(dispatch, false);
          })
          .catch((c) => {
            console.log(c);
            popUploader(dispatch, false);
            handleError(c);
          });
      });
    }
  };

  return (
    categoryList && (
      <Modal
        backdrop="static"
        size="md"
        isOpen={isOpen}
        toggle={() => {
          toggle();
          setCategoryName("");
          setSelectedParent("");
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
            setUploadedFile([]);
          }}
        >
          Update Category
        </ModalHeader>
        <ModalBody>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">
                  <Form className="mt-2">
                    {/* {currentData?.parentId != null ? (
                      <FormGroup>
                        <Label for="categoryName">
                          Update main category name{" "}
                        </Label>
                        <Input
                          className={"form-control"}
                          id="exampleSelect"
                          name="text"
                          type="select"
                          value={selectedParent}
                          placeholder="Update category name"
                          onChange={(e) => {
                            console.log(e.target.value);
                            setSelectedParent(e.target.value);
                          }}
                        >
                          {categoryList}
                        </Input>
                      </FormGroup>
                    ) : (
                      ""
                    )} */}

                    <FormGroup>
                      {currentData?.parentId != null ? (
                        <Label for="categoryName">
                          Update sub category name
                        </Label>
                      ) : (
                        <Label for="categoryName">
                          Update main category name
                        </Label>
                      )}

                      <Input
                        type="text"
                        name="categoryName"
                        id="categoryName"
                        placeholder="Category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      {currentData?.parentId != null ? (
                        <Label for="categoryName">
                          Update image of sub category{" "}
                        </Label>
                      ) : (
                        <Label for="categoryName">
                          Update image of main category{" "}
                        </Label>
                      )}
                    </FormGroup>
                    <Row>
                      <FormGroup className="">
                        {currentData?.file &&
                          Object.keys(uploadedFile).length === 0 && (
                            <div className="d-flex my-2 flex-wrap">
                              <img
                                src={currentData?.file.originalPath}
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
                            </div>
                          )}
                      </FormGroup>
                      <FormGroup>
                        {/* <Label for="categoryName">Select image for category </Label> */}

                        <button
                          className={"mt-2 clickToUploadButton w-50"}
                          type="button"
                          onClick={openToggle}
                        >
                          <Upload className={"upload_icon"} size={15} />
                          Click To Upload
                        </button>
                      </FormGroup>
                      <FormGroup className="">
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
                    </Row>
                    <div className="d-flex justify-content-end">
                      <Button
                        className="mx-2"
                        outline
                        color="secondary"
                        onClick={() => {
                          toggle();
                          setCategoryName("");
                          setSelectedParent("");
                          setUploadedFile([]);
                        }}
                      >
                        Cancel
                      </Button>{" "}
                      <Button color="primary" onClick={handleSubCategory}>
                        Update
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
    )
  );
};

export default UpdateCategory;
