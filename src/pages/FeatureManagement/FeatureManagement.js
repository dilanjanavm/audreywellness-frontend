import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import TagsInput from "react-tagsinput";
import FeatureValue from "../../Components/FeatureValues/FeatureValues";
import * as attributeAndTagService from "../../service/attributeAndTagService";
import { Plus } from "react-feather";
import AddFeatureModel from "../../Components/Common/modal/AddFeatureModel";
import UpdateFeatureModel from "../../Components/Common/modal/UpadateFeatureModel";
import { useDispatch } from "react-redux";
import { Table } from "antd";

const FeatureManagement = () => {
  const [tags, setTags] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [currentFeatureValues, setCurrentFeatureValues] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    getAllAttributes();
  }, []);

  const getAllAttributes = async () => {
    // popUploader(dispatch, true);
    const withTags = true;
    await setCurrentFeatureValues([]);
    attributeAndTagService
      .getAllAttributesWithTags(withTags)
      .then(async (res) => {
        console.log(res, "reeeeeeeeeeeeeeeeeeS");
        let featureData = [];
        await setCurrentFeatureValues([]);
        res?.data.map(async (feature, index) => {
          featureData.push(feature);
        });
        await setCurrentFeatureValues(featureData);
        // popUploader(dispatch, false);
      })
      .catch((c) => {
        console.log(c);
        // popUploader(dispatch, false);
      });
  };

  const addFeatureValue = async () => {
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
    getAllAttributes();
  };

  return (
    <React.Fragment>
      {isModalOpen && (
        <AddFeatureModel isOpen={isModalOpen} toggle={toggleModal} />
      )}

      <div className="page-content">
        <Container fluid>
          <div className="row">
            <h4>Feature Management</h4>
          </div>
          <div class="row mx-1">
            <Card>
              <Row className=" mt-2 d-flex justify-content-end">
                <Col
                  sm={12}
                  md={2}
                  lg={3}
                  className=" d-flex justify-content-end"
                >
                  <Button color="primary" onClick={addFeatureValue}>
                    {" "}
                    <Plus size={18} />
                    Add Feature Value
                  </Button>
                </Col>
              </Row>

              {/* no data table */}
              {currentFeatureValues.length <= 0 && (
                <CardBody>
                  <Table />
                </CardBody>
              )}

              {/* if data exists */}
              {currentFeatureValues.length > 0 && (
                <CardBody>
                  {currentFeatureValues?.map((currentFeatureValue, index) => (
                    <FeatureValue
                      reload={() => {
                        // popUploader(dispatch, true);
                        getAllAttributes();
                      }}
                      currentData={currentFeatureValue}
                      removeDetails={(e) => {}}
                      indexOfComponent={featureValues.length}
                    />
                  ))}
                </CardBody>
              )}
            </Card>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FeatureManagement;
