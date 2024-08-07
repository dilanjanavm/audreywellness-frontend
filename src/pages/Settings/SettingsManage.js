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
import { getAllSettings } from "../../service/settingService";

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
    getAllSettings()
      .then((res) => {
        setSettingsList(res?.data);
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
