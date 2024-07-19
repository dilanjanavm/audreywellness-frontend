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
import TagsInput from "react-tagsinput";
import FeatureValue from "../../Components/FeatureValues/FeatureValues";
import * as attributeAndTagService from "../../service/attributeAndTagService";
import { Plus } from "react-feather";
import AddFeatureModel from "../../Components/Common/modal/AddFeatureModel";
import UpdateFeatureModel from "../../Components/Common/modal/UpadateFeatureModel";
import { useDispatch } from "react-redux";
import { Table } from "antd";
import { handleError, popUploader } from "../../common/commonFunctions";
import debounce from "lodash.debounce";

const FeatureManagement = () => {
  document.title = "Feature Management| Address Shop";

  const [tags, setTags] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [currentFeatureValues, setCurrentFeatureValues] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchFeatureName, setSearchFeatureName] = useState("");

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    getAllAttributes();
  }, []);

  const getAllAttributes = async () => {
    popUploader(dispatch, true);
    const withTags = true;
    await setCurrentFeatureValues([]);
    attributeAndTagService
      .getAllAttributesWithTags(withTags)
      .then(async (res) => {
        let featureData = [];
        await setCurrentFeatureValues([]);
        res?.data.map(async (feature, index) => {
          featureData.push(feature);
        });
        await setCurrentFeatureValues(featureData);
        setCurrentPage(res?.data?.currentPage);
        setTotalRecodes(res?.data?.totalRecords);
        popUploader(dispatch, false);
      })
      .catch((c) => {
        console.log(c);
        handleError(c);
        popUploader(dispatch, false);
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
                  <Button color="primary" className="mt-2" onClick={addFeatureValue}>
                    {" "}
                    <Plus size={18} />
                    Add Feature Value
                  </Button>
                </Col>
              </Row>

              <Row className="mx-2">
                <Col sm={12} md={6} lg={4} xl={4}>
                  <FormGroup>
                    <Label for="featureName">Search by Feature Name</Label>
                    <Input
                      id="featureName"
                      name="featureName"
                      placeholder="Search by feature name"
                      type="text"
                      value={searchFeatureName}
                      onChange={(e) => {
                        setSearchFeatureName(e.target.value);
                      }}
                    />
                  </FormGroup>
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
                        popUploader(dispatch, true);
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
