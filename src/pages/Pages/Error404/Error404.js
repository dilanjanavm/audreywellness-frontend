import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import errorVideo from "../../../assets/videos/404.mp4";
import "./Error404.scss";

const Error404 = () => {
  document.title = "404 - Page Not Found | Address Shop";
  const navigate = useNavigate();

  return (
    <div className="error-404-page">
      {/* Video Background */}
      <div className="error-404-video-wrapper">
        <video
          className="error-404-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={errorVideo} type="video/mp4" />
        </video>
        <div className="error-404-overlay"></div>
      </div>

      {/* Content */}
      <Container className="error-404-content">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={8} md={10} sm={12} className="text-center">
            <div className="error-404-text-content">
              <h1 className="error-404-title">404</h1>
              <h2 className="error-404-subtitle">Page Not Found</h2>
              <p className="error-404-description">
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
              </p>
              <div className="error-404-actions">
                <Button
                  color="primary"
                  size="lg"
                  className="error-404-btn me-3"
                  onClick={() => navigate("/dashboard")}
                >
                  <HomeOutlined className="me-2" />
                  Go to Dashboard
                </Button>
                <Button
                  color="light"
                  size="lg"
                  className="error-404-btn"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeftOutlined className="me-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Error404;
