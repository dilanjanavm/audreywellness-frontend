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
} from "reactstrap";
import ReactEditList, * as REL from "react-edit-list";
// import { preventDefault } from "@fullcalendar/core/internal";
import { customToastMsg, popUploader } from "../../../common/commonFunctions";
import * as attributeAndTagService from "../../../service/attributeAndTagService";

import { useDispatch } from "react-redux";

const AddFeatureModel = ({ isOpen, toggle, currentData }) => {
  const [featureName, setFeatureName] = useState("");
  const [currentTerms, setCurrentTerms] = useState([]);
  const [terms, setTerms] = useState([]);

  const dispatch = useDispatch();
  const handleSubmit = () => {
    let tempTags = [];
    terms.map((term, index) => {
      tempTags.push({
        // id: null,
        name: term.Values,
      });
    });

    let data = {
      // id: null,
      attributeName: featureName,
      tags: tempTags,
    };
    let isValid = false;
    featureName.trim() === ""
      ? customToastMsg("Feature name cannot be empty!", 2)
      : terms.length === 0 || terms.length < 0
      ? customToastMsg("At least add one value", 2)
      : (isValid = true);

    if (isValid) {
      console.log(data, "created data");
      popUploader(dispatch, true);
      attributeAndTagService
        .createAttributesWithTags(data)
        .then((res) => {
          console.log(res, "created response");
          toggle();
          popUploader(dispatch, false);
          customToastMsg("New feature added successfully !", 1);
        })
        .catch((c) => {
          console.log(c);
          popUploader(dispatch, false);
          c.response.data.message
            ? customToastMsg(c.response.data.message[0], 0)
            : customToastMsg("Sorry! Try again later", 0);
        });
    }
    //toggle();
  };

  const valuesInsert = (value) => {
    let temp = [];
    temp = currentTerms;
    temp.push({ name: value.Values });

    setCurrentTerms(temp);

    // setCurrentTerms(temp)
    // //toggle();
    console.log("currentTerms", temp);
  };

  // const schema: REL.Schema = [
  //     { name: "id", type: "id" },
  //     { name: "Values", type: "string" },
  // ];
  const schema = [
    { name: "id", type: "id" },
    { name: "Values", type: "string" },
  ];

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // e.preventDefault();
    }
  };

  return (
    <Modal size="md" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Add New Feature</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="featureName">Add Feature Name</Label>
            <Input
              required
              type="text"
              name="featureName"
              id="featureName"
              placeholder="Eg: Size"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </FormGroup>
          <FormGroup>
            <ReactEditList
              schema={schema}
              onLoad={() => []}
              onUpdate={(item) => {}}
              onDelete={(item) => {}}
              onInsert={(item) => {
                valuesInsert(item);
              }}
              onChange={(e) => {
                setTerms(e);
              }}
              className="table bg-light table-fixed align-middle"
              headClassName="bg-primary-light"
              inputClassName="w-100 form-control"
              thClassName={{
                // These allow to fix the column widths
                product: "col-4",
                type: "col-3",
                price: "col-2",
                stock: "col-2",
                buttons: "col-1",
              }}
              btnValidateElement={
                <Button outline color="warning mx-1">
                  Add
                </Button>
              }
              btnCancelElement={
                <Button outline color="secondary">
                  No
                </Button>
              }
              btnDeleteElement={
                <Button outline color="danger">
                  Remove
                </Button>
              }
              filler={
                <React.Fragment>
                  <small className={"text-secondary"}>+ Add New Value</small>
                </React.Fragment>
              }
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Add New Feature
        </Button>{" "}
      </ModalFooter>
    </Modal>
  );
};

export default AddFeatureModel;
