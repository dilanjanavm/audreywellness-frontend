import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Label,
  Input,
  FormGroup,
  Button,
} from "reactstrap";
import { Pagination, Table } from "antd";
import { Plus } from "react-feather";
import { StoresTableColumns } from "../../common/tableColumns";
import * as storeLocaterService from "../../service/storeLocaterService";
import { useDispatch } from "react-redux";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import StoreLocaterModal from "../../Components/Common/modal/StoreLocaterModal";

const StoresManagement = () => {
  document.title = "Store Management| Address Shop";

  const [storesTableList, setStoresTableList] = useState([]);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [isUpdateStoreModalOpen, setIsUpdateStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState([]);
  const [searchPostalCode, setSearchPostalCode] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllStoreLocaters(currentPage);
  }, []);

  const loadAllStoreLocaters = (currentPage) => {
    setStoresTableList([]);
    clearFiltrationFields();
    popUploader(dispatch, true);
    storeLocaterService
      .getAllStores(currentPage)
      .then((res) => {
        const formattedData = res?.data?.records.map((record) => ({
          name: record?.title,
          address: record?.addressLine,
          city: record?.city,
          country: record?.country,
          postalCode: record?.postalCode,
          url: (
            <a href={record.url} target="blank">
              {record.url}
            </a>
          ),
          action: (
            <>
              <Button
                color="warning"
                className="m-2"
                outline
                onClick={(e) => {
                  toggleModal(record);
                }}
              >
                <span>Update</span>
              </Button>
              <Button
                color="danger"
                className="m-2"
                outline
                onClick={() => deleteStoreLocater(record.id)}
              >
                <span>Remove</span>
              </Button>
            </>
          ),
        }));
        setStoresTableList(formattedData);
        setCurrentPage(res?.data?.currentPage);
        setTotalRecodes(res?.data?.totalCount);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const searchStoreLocatersFiltration = (
    postalCode,
    city,
    address,
    currentPage
  ) => {
    popUploader(dispatch, true);
    let temp = [];
    if (postalCode === "" && city === "" && address === "") {
      loadAllStoreLocaters(currentPage);
    } else {
      let data = {
        postalCode: postalCode,
        city: city,
        address: address,
      };

      storeLocaterService
        .getAllStoreFiltration(data, currentPage)
        .then((res) => {
          const formattedData = res?.data?.records.map((record) => ({
            name: record?.title,
            address: record?.addressLine,
            city: record?.city,
            country: record?.country,
            postalCode: record?.postalCode,
            url: (
              <a href={record.url} target="blank">
                {record.url}
              </a>
            ),
            action: (
              <>
                <Button
                  color="warning"
                  className="m-2"
                  outline
                  onClick={(e) => {
                    toggleModal(record);
                  }}
                >
                  <span>Update</span>
                </Button>
                <Button
                  color="danger"
                  className="m-2"
                  outline
                  onClick={() => deleteStoreLocater(record.id)}
                >
                  <span>Remove</span>
                </Button>
              </>
            ),
          }));
          setStoresTableList(formattedData);
          setCurrentPage(res?.data?.currentPage);
          setTotalRecodes(res?.data?.totalCount);
          popUploader(dispatch, false);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
          console.log(err);
        });
    }
  };

  const debounceSearchStoreLocatersFiltration = React.useCallback(
    debounce(searchStoreLocatersFiltration, 500),
    []
  );

  const deleteStoreLocater = (storeId) => {
    console.log(storeId);
    customSweetAlert("Are you sure to delete this store ?", 0, () => {
      popUploader(dispatch, true);
      storeLocaterService
        .deleteStore(storeId)
        .then((res) => {
          loadAllStoreLocaters(currentPage);
          popUploader(dispatch, false);
          customToastMsg("Store has been  deleted", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        })
        .finally();
    });
  };

  const toggleModal = (val) => {
    console.log(val, "00000000000");
    if (val !== undefined) {
      setIsAddStoreModalOpen(true);
      setIsUpdateStoreModalOpen(true);
      setSelectedStore(val);
      loadAllStoreLocaters(currentPage);
    } else {
      setIsAddStoreModalOpen(true);
      loadAllStoreLocaters(currentPage);
    }
  };

  const closeStoreModal = () => {
    setIsAddStoreModalOpen(false);
    setIsUpdateStoreModalOpen(false);
    setSelectedStore([]);
    loadAllStoreLocaters(currentPage);
  };

  const clearFiltrationFields = () => {
    setSearchPostalCode("");
    setSearchCity("");
    setSearchAddress("");
  };

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (postalCode === "" && city === "" && address === "") {
      loadAllStoreLocaters(page);
    } else {
      debounceSearchStoreLocatersFiltration(
        searchPostalCode,
        searchCity,
        searchAddress,
        page
      );
    }
  };

  return (
    <div className="page-content">
      <StoreLocaterModal
        isUpdate={isUpdateStoreModalOpen}
        updateValue={selectedStore}
        isOpen={isAddStoreModalOpen}
        toggle={(e) => {
          loadAllStoreLocaters(currentPage);
          closeStoreModal();
        }}
      />
      <Container fluid>
        <div className="row mt-3">
          <h4>Stores Management</h4>
        </div>
        <Card>
          <Row className="d-flex mt-4 mb-2 mx-1 justify-content-end">
            <Col
              sm={12}
              md={3}
              lg={3}
              xl={3}
              className="d-flex justify-content-end"
            >
              <Button
                color="primary"
                onClick={() => {
                  toggleModal();
                }}
              >
                <Plus size={24} /> Add New Store
              </Button>
            </Col>
          </Row>
          <Row className="mx-2">
            <Col sm={12} md={4} lg={3} xl={3}>
              <FormGroup>
                <Label for="postalCode">Search by Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  placeholder="Search by postal code"
                  type="text"
                  value={searchPostalCode}
                  onChange={(e) => {
                    setSearchPostalCode(e.target.value);
                    debounceSearchStoreLocatersFiltration(
                      e.target.value,
                      searchCity,
                      searchAddress,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={3} xl={3}>
              <FormGroup>
                <Label for="city">Search by City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Search by city"
                  type="text"
                  value={searchCity}
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    debounceSearchStoreLocatersFiltration(
                      searchPostalCode,
                      e.target.value,
                      searchAddress,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={4} lg={3} xl={3}>
              <FormGroup>
                <Label for="address">Search by Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Search by address"
                  type="text"
                  value={searchAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    debounceSearchStoreLocatersFiltration(
                      searchPostalCode,
                      searchCity,
                      e.target.value,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={false}
                columns={StoresTableColumns}
                dataSource={storesTableList}
                scroll={{ x: "fit-content" }}
              />
            </Col>
          </Row>
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
      </Container>
    </div>
  );
};

export default StoresManagement;
