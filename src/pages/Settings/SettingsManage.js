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
import SettingsCard from "../../Components/Common/cards/SettingsCard";
import UpdateSettingsModel from "../../Components/Common/modal/UpdateSettingsModel";

const SettingManagement = () => {
  document.title = "Settings | Address Shop";

  const [settingsList, setSettingsList] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllSettings();
  }, []);

  useEffect(() => {
    if (isRefresh) {
      loadAllSettings();
      setIsRefresh(false);
    }
  }, [isRefresh]);

  const loadAllSettings = () => {
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
          <Row className="mx-2 my-3">
            {settingsList.map((setting, index) => (
              <SettingsCard
                key={index}
                reload={async () => {
                  setIsRefresh(true);
                }}
                settingData={setting}
              />
            ))}
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default SettingManagement;
