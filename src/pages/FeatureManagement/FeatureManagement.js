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
import Select from "react-select";
import TagsInput from "react-tagsinput";
import FeatureValue from "../../Components/FeatureValues/FeatureValues";
import * as attributeAndTagService from "../../service/attributeAndTagService";
import { Plus } from "react-feather";
import AddFeatureModel from "../../Components/Common/modal/AddFeatureModel";
import UpdateFeatureModel from "../../Components/Common/modal/UpadateFeatureModel";
import { useDispatch } from "react-redux";
import { Pagination, Table } from "antd";
import { handleError, popUploader } from "../../common/commonFunctions";
import debounce from "lodash.debounce";

const FeatureManagement = () => {
  document.title = "Feature Management| Address Shop";

  const [tags, setTags] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [currentFeatureValues, setCurrentFeatureValues] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchFeatureName, setSearchFeatureName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    loadAllAttributes(currentPage);
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const loadAllAttributes = async (currentPage) => {
    popUploader(dispatch, true);
    clearFiltrationFields();
    const withTags = true;
    setCurrentFeatureValues([]);
    attributeAndTagService
      .getAllAttributesWithTags(withTags, currentPage)
      .then(async (res) => {
        let featureData = [];
        setCurrentFeatureValues([]);
        res?.data.map(async (feature, index) => {
          featureData.push(feature);
        });
        setCurrentFeatureValues(featureData);
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
    loadAllAttributes(currentPage);
  };

  const searchAttributesFiltration = (name, status, currentPage) => {
    popUploader(dispatch, true);
    let temp = [];
    if (name === "" && status === "") {
      loadAllAttributes(currentPage);
    } else {
      popUploader(dispatch, true);
      const withTags = true;
      setCurrentFeatureValues([]);
      attributeAndTagService
        .attributesWithTagsFiltration(withTags, name, status, currentPage)
        .then(async (res) => {
          let featureData = [];
          setCurrentFeatureValues([]);
          res?.data.map(async (feature, index) => {
            featureData.push(feature);
          });
          setCurrentFeatureValues(featureData);
          setCurrentPage(res?.data?.currentPage);
          setTotalRecodes(res?.data?.totalRecords);
          popUploader(dispatch, false);
        })
        .catch((c) => {
          handleError(c);
          popUploader(dispatch, false);
        });
    }
  };

  const debounceSearchAttributesFiltration = React.useCallback(
    debounce(searchAttributesFiltration, 500),
    []
  );

  const clearFiltrationFields = () => {
    setSearchFeatureName("");
    setSelectedStatus("");
  };

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (searchFeatureName === "" && selectedStatus === "") {
      loadAllAttributes(page);
    } else {
      debounceSearchAttributesFiltration(
        searchFeatureName,
        selectedStatus,
        page
      );
    }
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
                  md={6}
                  lg={3}
                  className=" d-flex justify-content-end "
                >
                  <Button
                    color="primary"
                    className="my-2"
                    onClick={addFeatureValue}
                  >
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
                        debounceSearchAttributesFiltration(
                          e.target.value,
                          selectedStatus,
                          1
                        );
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col sm={12} md={6} lg={4} xl={4}>
                  <FormGroup>
                    <Label for="exampleEmail">Search by status</Label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable
                      value={
                        statusList.find(
                          (option) => option.value === selectedStatus
                        ) || null
                      }
                      onChange={(e) => {
                        setSelectedStatus(
                          e?.value === undefined
                            ? ""
                            : e === null
                            ? ""
                            : e.value
                        );
                        debounceSearchAttributesFiltration(
                          searchFeatureName,
                          e?.value === undefined
                            ? ""
                            : e === null
                            ? ""
                            : e.value,
                          1
                        );
                      }}
                      options={statusList}
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
                        loadAllAttributes(currentPage);
                      }}
                      currentData={currentFeatureValue}
                      removeDetails={(e) => {}}
                      indexOfComponent={featureValues.length}
                    />
                  ))}
                </CardBody>
              )}
              <Row>
                <Col
                  className=" d-flex justify-content-end"
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                >
                  <Pagination
                    className="m-3"
                    current={currentPage}
                    onChange={onChangePagination}
                    defaultPageSize={15}
                    total={totalRecodes}
                    showTotal={(total) => `Total ${total} items`}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FeatureManagement;
