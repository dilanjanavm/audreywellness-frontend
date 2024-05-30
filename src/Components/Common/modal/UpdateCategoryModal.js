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
} from "../../../common/commonFunctions";
import * as categoryService from "../../../service/categoryService";
import classnames from "classnames";

const UpdateCategory = ({ isOpen, toggle, currentData }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [activeTab, setActiveTab] = useState("2");

  const [allCategories, setAllCategories] = useState([]);

  const setCurrentData = () => {
    //currentData

    setCategoryName(currentData.name);
    setSelectedParent(currentData.parent_id);
  };

  useEffect(() => {
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
        // popUploader(dispatch, false);
      })
      .catch((c) => {
        // popUploader(dispatch, false);
        // handleError(c);
      });
  }, [isOpen]);

  const handleSubCategory = () => {
    let data = {
      name: categoryName,
      parent_id: selectedParent,
    };
    customSweetAlert("Are you sure to update this?", 2, () => {
      categoryName.trim() === ""
        ? customToastMsg("Category name cannot be empty!", 0)
        : categoryService
            .update(currentData.id, data)
            .then((res) => {
              customToastMsg("Category updated successfully !", 1);
              toggle();
              setCategoryName("");
              setActiveTab("1");
            })
            .catch((c) => {
              console.log(c);
              c.response?.data.message
                ? customToastMsg(c.response.data.message, 0)
                : customToastMsg("Sorry! Try again later", 0);
            });
    });
  };

  return (
    categoryList && (
      <Modal backdrop="static" size="md" isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update Category</ModalHeader>
        <ModalBody>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">
                  <Form className="mt-2">
                    {currentData?.parentId != null ? (
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
                    )}

                    <FormGroup>
                      {currentData?.parentId != null ? (
                        <Label for="categoryName">
                          Update sub category Name
                        </Label>
                      ) : (
                        <Label for="categoryName">
                          Update main category Name
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
