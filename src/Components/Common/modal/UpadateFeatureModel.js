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
import { customToastMsg } from "../../../common/commonFunctions";
import * as attributeAndTagService from "../../../service/attributeAndTagService";

const UpdateFeatureModel = ({ isOpen, toggle, currentData }) => {
  const [featureName, setFeatureName] = useState("");
  const [currentTerms, setCurrentTerms] = useState("");
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    setFeatureName(currentData.name);
    let data = [];

    currentData?.terms?.map((val, index) => {
      data.push({ id: val.id, Values: val.name });
    });
    setCurrentTerms(data);
  }, []);

  const handleSubmit = () => {
    console.log(currentData, currentTerms);
    let tempTerms = [];
    currentTerms.map((term, index) => {
      tempTerms.push({
        id: term.id ? term.id : null,
        name: term.Values,
      });
    });
    console.log(tempTerms);
    let data = {
      id: currentData.id,
      name: featureName,
      terms: tempTerms,
    };

    featureName.trim() === ""
      ? customToastMsg("Feature name cannot be empty!", 0)
      : currentTerms.length === 0 || currentTerms.length < 0
      ? customToastMsg("At least add one value", 0)
      : console.log("test");
    //   : attributeService
    //       .addAndUpdateAttributes(data)
    //       .then((res) => {
    //         customToastMsg("Feature updated successfully !", 1);
    //         toggle();
    //       })
    //       .catch((c) => {
    //         console.log(c);
    //         c.response.data.message
    //           ? customToastMsg(c.response.data.message, 0)
    //           : customToastMsg("Sorry! Try again later", 0);
    //       });
  };

  // const schema: REL.Schema = [
  //     {name: "id", type: "id"},
  //     {name: "Values", type: "string"},
  // ];
  const schema = [
    { name: "id", type: "id" },
    { name: "Values", type: "string" },
  ];

  return (
    <Modal size="md" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Update Feature</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="featureName">Update Feature Name</Label>
            <Input
              type="text"
              name="featureName"
              placeholder="Update feature name"
              id="featureName"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <ReactEditList
              schema={schema}
              onLoad={() => currentTerms}
              onUpdate={(item) => {}}
              onDelete={(item) => {}}
              onInsert={(item) => {}}
              onChange={(e) => {
                setCurrentTerms(e);
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
                  Update
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
        <Button color="primary" onClick={handleSubmit}>
          Save Changes
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpdateFeatureModel;
