import React, { useEffect, useState } from "react";
import "../../../assets/scss/components/productCard.scss";
import { Col, Button, Row } from "reactstrap";
import { PenTool } from "react-feather";
import {
  customSweetAlert,
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import { useNavigate } from "react-router-dom";
import { Card, Switch } from "antd";
import { useDispatch } from "react-redux";
import { updateSetting } from "../../../service/settingService";
import parse from "html-react-parser";
import UpdateSettingsModel from "../modal/UpdateSettingsModel";

const SettingsCard = ({ settingData, reload }) => {
  const history = useNavigate();
  const dispatch = useDispatch();
  const [isOpenUpdateSettingModal, setIsOpenUpdateSettingModal] =
    useState(false);

  useEffect(() => {
    console.log(settingData, "*********************");
  }, []);

  const changeStatusProduct = (settingData) => {
    const newStatus = settingData.status === 1 ? 2 : 1;

    const data = {
      value: settingData?.value,
      status: newStatus,
    };

    customSweetAlert(
      settingData.status === 1
        ? "Do you want to deactivate this setting?"
        : "Do you want to activate this setting?",
      2,
      () => {
        popUploader(dispatch, true);
        updateSetting(settingData.id, data)
          .then((res) => {
            popUploader(dispatch, false);
            customToastMsg(
              `Setting ${1 ? "deactivated" : "activated"} successfully`,
              1
            );
            reload();
          })
          .catch((c) => {
            popUploader(dispatch, false);
            handleError(c);
          });
      }
    );
  };

  const updateProductDetails = () => {
    setIsOpenUpdateSettingModal(true);
  };

  return (
    <Col sm={12} md={12} lg={12} xl={12} xxl={12} className="my-2 ">
      <UpdateSettingsModel
        isOpen={isOpenUpdateSettingModal}
        currentData={settingData}
        onClose={(e) => {
          setIsOpenUpdateSettingModal(false);
          reload();
        }}
      />
      <Card
        hoverable
        title={settingData?.key}
        extra={
          <Switch
            disabled={settingData?.isDefault}
            checked={
              settingData.status === 1
                ? true
                : settingData.status === 2
                ? false
                : false
            }
            onChange={(e) => {
              changeStatusProduct(settingData);
            }}
            handleBg={settingData.status === 1 ? "#60b24c" : "#bababa"}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            style={{
              backgroundColor: settingData.status === 1 ? "#60b24c" : "#bababa",
            }}
          />
        }
      >
        {settingData?.type === "html" ? (
          <p>{parse(settingData?.value)}</p>
        ) : (
          <p>{settingData?.value}</p>
        )}
        <Row className="d-flex justify-content-end align-items-center">
          {" "}
          <Col
            sm={12}
            md={2}
            lg={2}
            className="featureValue d-flex justify-content-end "
          >
            <Button
              color="warning"
              outline
              onClick={() => {
                updateProductDetails();
              }}
            >
              <PenTool size={16} /> <span>Update</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

export default SettingsCard;
