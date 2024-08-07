import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col } from "reactstrap";
import * as customerService from "../../service/customerService";
import { useDispatch } from "react-redux";
import Select from "react-select";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";

const SettingManagement = () => {
  document.title = "Settings | Address Shop";

  const [settingsList, setSettingsList] = useState([]);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCustomers();
  }, []);

  const loadAllCustomers = () => {
    setSettingsList([]);
    popUploader(dispatch, true);
    customerService
      .getAllCustomers()
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

        setSettingsList(temp);
        popUploader(dispatch, false);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Settings</h4>
        </div>
        <Card>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}></Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default SettingManagement;
