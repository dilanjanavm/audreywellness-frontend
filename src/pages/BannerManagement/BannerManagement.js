import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button } from "reactstrap";
import { Upload, message, Card as AntCard } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Plus } from "react-feather";
import * as bannerService from "../../service/bannerService";
import BannerModel from "../../Components/Common/modal/AddBannerModel";

const BannerManagement = () => {
  document.title = "Banners | Address Shop";

  const [banners, setBanners] = useState([]);
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);

  const positions = ["TOP", "MIDDLE", "BOTTOM"];

  useEffect(() => {
    getAllBanners();
  }, []);

  const getAllBanners = async () => {
    try {
      const res = await bannerService.getAll();
      console.log(res, "banner response");
      setBanners(res.data);
    } catch (error) {
      message.error("Failed to fetch banners");
    }
  };

  const toggleModal = () => {
    setIsAddBannerModalOpen(!isAddBannerModalOpen);
  };

  const closeModal = () => {
    setIsAddBannerModalOpen(false);
    getAllBanners();
  };

  const handleDeleteBanner = (id) => {
    setBanners(banners.filter((banner) => banner.id !== id));
  };

  const renderBannersByPosition = (position) => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {banners
          .filter((banner) => banner.position === position)
          .map((banner) => (
            <AntCard
              key={banner.id}
              cover={
                <img
                  alt="banner"
                  src={banner.file.originalPath}
                  style={{ height: "100px", objectFit: "cover" }}
                />
              }
              style={{ width: "150px", margin: "0.5rem", position: "relative" }}
              actions={[
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleDeleteBanner(banner.id)}
                />,
              ]}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Banner Management</h4>
        </div>
        <Card>
          <Row className="mt-5 mx-2">
            <Col
              sm={12}
              md={6}
              lg={3}
              xl={3}
              className="d-flex align-items-end"
            >
              <Button color="primary" onClick={toggleModal}>
                <Plus size={16} className="mr-1" /> Create Banner
              </Button>
            </Col>
          </Row>
        </Card>

        {positions.map((position) => (
          <Card key={position} className="mt-4">
            <h5 className="mx-3 my-3">{position}</h5>
            <Row className="mx-2">
              <Col>{renderBannersByPosition(position)}</Col>
            </Row>
          </Card>
        ))}

        <BannerModel isOpen={isAddBannerModalOpen} toggle={closeModal} />
      </Container>
    </div>
  );
};

export default BannerManagement;
