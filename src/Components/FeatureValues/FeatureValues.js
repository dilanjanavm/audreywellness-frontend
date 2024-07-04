import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import "../../assets/scss/pages/_featuresManagement.scss";
import { PenTool, Save, Trash, Trash2, X, XCircle } from "react-feather";
import UpdateFeatureModel from "../Common/modal/UpadateFeatureModel";
import * as attributeAndTagService from "../../service/attributeAndTagService";
import { customSweetAlert, customToastMsg } from "../../common/commonFunctions";
import { useDispatch } from "react-redux";

const FeatureValue = ({
  indexOfComponent,
  getValue,
  reload,
  removeDetails,
  currentData,
}) => {
  const [tags, setTags] = useState([]);
  const [featureName, setFeatureName] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    currentData && getValuesFromDB();
  }, []);

  const getValuesFromDB = () => {
    setFeatureName(currentData?.name);
    setTags(currentData.terms);
  };

  const extractTermsNames = (response) => {
    if (!response || !response.terms || !Array.isArray(response.terms)) {
      return []; // Return an empty array if the response or terms are not as expected
    }

    return response.terms.map((term) => term.name);
  };

  const handleChange = (tags) => {
    setTags(tags);
  };
  const updateFeatureValues = () => {
    setModalOpen(true);
  };
  const addFeatureValues = () => {
    const terms = tags.map((tag, index) => ({
      id: null,
      name: tag,
    }));
    let data = {
      id: null,
      name: featureName,
      term: terms,
    };
  };
  const removeValueFromAttribute = (term) => {
    customSweetAlert("Are you sure to delete this feature?", 0, () => {
      // popUploader(dispatch, true)
      console.log(term);
      // attributeService
      //   .deleteFeature(currentData.id)
      //   .then((res) => {
      //     reload();
      //     // popUploader(dispatch, false)
      //   })
      //   .catch((c) => {
      //     // popUploader(dispatch, false)
      //     handleChange(c);
      //   });
    });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
    reload();
  };
  return (
    <React.Fragment>
      <UpdateFeatureModel
        currentData={currentData}
        isOpen={isModalOpen}
        toggle={toggleModal}
      />

      <Card className={``}>
        <CardBody>
          <Row className="my-3">
            <Col sm={6} md={4} lg={3} className="featureValue">
              <FormGroup className="w-100 ">
                <Label>Feature Name</Label>
                <Input
                  disabled={currentData}
                  value={featureName}
                  onChange={(value) => {
                    setFeatureName(value.target.value);
                  }}
                  placeholder="Feature"
                  className="w-100 "
                />
              </FormGroup>
            </Col>
            {/* <Col sm={6} md={8} lg={9}>
              <FormGroup className="featureValueTags">
                <Label>Values</Label>
                <div class="d-flex flex-row ">
                  {currentData?.tags?.map((value, index) => (
                    <div className=" mx-1  ">
                      <h5>
                        {" "}
                        <span className="md badge bg-primary-subtle text-primary badge-border">
                          {value?.name}{" "}
                        </span>
                      </h5>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </Col> */}

            <Col sm={6} md={8} lg={9}>
              <FormGroup className="featureValueTags">
                <Label>Values</Label>
                <div
                  style={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                  className="d-flex flex-row"
                >
                  {currentData?.tags?.map((value, index) => (
                    <div
                      key={index}
                      style={{
                        margin: "5px",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className="tag-item"
                    >
                      <h5>
                        <span
                          style={{ whiteSpace: "nowrap" }}
                          className="md badge bg-primary-subtle text-primary badge-border"
                        >
                          {value?.name}
                        </span>
                      </h5>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </Col>
          </Row>

          <Row className="  d-flex justify-content-end ">
            <Col
              sm={12}
              md={2}
              lg={2}
              className="featureValue d-flex justify-content-between "
            >
              <Button
                onClick={(e) => {
                  removeValueFromAttribute(indexOfComponent);
                }}
                outline
                color="danger"
                className="w-100 justify-content-center d-flex align-items-center"
              >
                <Trash2 size={16} /> <span>Delete</span>
              </Button>
            </Col>
            {currentData && (
              <Col
                sm={12}
                md={2}
                lg={2}
                className="featureValue d-flex justify-content-between "
              >
                <Button
                  onClick={(e) => {
                    updateFeatureValues();
                  }}
                  outline
                  color="warning"
                  className="w-100 justify-content-center d-flex align-items-center"
                >
                  <PenTool size={16} /> <span>Update</span>
                </Button>
              </Col>
            )}
            {!currentData && (
              <Col
                sm={12}
                md={2}
                lg={2}
                className="featureValue d-flex justify-content-between "
              >
                <Button
                  onClick={(e) => {
                    addFeatureValues();
                  }}
                  outline
                  color="success"
                  className="w-100 justify-content-center d-flex align-items-center"
                >
                  <Save size={16} /> <span>Save</span>
                </Button>
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default FeatureValue;
