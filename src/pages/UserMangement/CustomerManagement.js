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
import { Pagination, Table, Tag } from "antd";
import { Plus } from "react-feather";
import { CustomerTableColumns } from "../../common/tableColumns";
import * as customerService from "../../service/customerService";
import { useDispatch } from "react-redux";
import Select from "react-select";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";

const CustomerManagement = () => {
  document.title = "Customers | Address Shop";

  const [memberTableList, setMemberTableList] = useState([]);
  const [searchContactNo, setSearchContactNo] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  //-------------------------- pagination --------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecodes, setTotalRecodes] = useState(0);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCustomers(currentPage);
    setStatusList([
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ]);
  }, []);

  const loadAllCustomers = (currentPage) => {
    setMemberTableList([]);
    popUploader(dispatch, true);
    customerService
      .getAllCustomers(currentPage)
      .then((res) => {
        const formattedData = res.data.map((record) => {
          return {
            name: record.user.firstName + " " + record.user.lastName,
            contactNo:
              record.user.customer.dialCode +
              " " +
              record.user.customer.contactNo,

            email: record.user.email,
            status: record.user.status,
          };
        });
        setCurrentPage(res?.data?.currentPage);
        setTotalRecodes(res?.data?.totalCount);
        setMemberTableList(formattedData);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const searchCustomerFiltration = (email, contactNo, status, currentPage) => {
    popUploader(dispatch, true);
    let temp = [];
    if (email === "" && contactNo === "" && status === "") {
      loadAllCustomers(currentPage);
    } else {
      let data = {
        email: email,
        contactNo: contactNo,
        status: status,
      };

      setMemberTableList([]);
      popUploader(dispatch, true);
      customerService
        .customerFiltration(data, currentPage)
        .then((res) => {
          const formattedData = res.data.map((record) => {
            return {
              name: record.user.firstName + " " + record.user.lastName,
              contactNo:
                record.user.customer.dialCode +
                " " +
                record.user.customer.contactNo,

              email: record.user.email,
              status: record.user.status,
            };
          });
          setCurrentPage(res?.data?.currentPage);
          setTotalRecodes(res?.data?.totalCount);
          setMemberTableList(formattedData);
          popUploader(dispatch, false);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  const debounceSearchCustomerFiltration = React.useCallback(
    debounce(searchCustomerFiltration, 500),
    []
  );

  const onChangePagination = (page) => {
    setCurrentPage(page);
    if (postalCode === "" && city === "" && address === "") {
      loadAllCustomers(page);
    } else {
      debounceSearchCustomerFiltration(
        searchEmail,
        searchContactNo,
        selectedStatus,
        page
      );
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Customer Management</h4>
        </div>
        <Card>
          <Row className="mt-5 mx-2">
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="email">Search by Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Search by email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    debounceSearchCustomerFiltration(
                      e.target.value,
                      searchContactNo,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="contactNo">Search by Contact No</Label>
                <Input
                  id="contactNo"
                  name="contactNo"
                  placeholder="Search by contact no"
                  type="number"
                  value={searchContactNo}
                  onChange={(e) => {
                    setSearchContactNo(e.target.value);
                    debounceSearchCustomerFiltration(
                      searchEmail,
                      e.target.value,
                      selectedStatus,
                      1
                    );
                  }}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <Label>Search By Status</Label>
              <Select
                value={
                  statusList.find(
                    (option) => option.value === selectedStatus
                  ) || null
                }
                className="basic-single"
                classNamePrefix="Search customer by status"
                isSearchable={true}
                isClearable
                onChange={(e) => {
                  setSelectedStatus(
                    e?.value === undefined ? "" : e === null ? "" : e.value
                  );
                  debounceSearchCustomerFiltration(
                    searchEmail,
                    searchContactNo,
                    e?.value === undefined ? "" : e === null ? "" : e.value,
                    1
                  );
                }}
                options={statusList}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={false}
                columns={CustomerTableColumns}
                dataSource={memberTableList}
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

export default CustomerManagement;
