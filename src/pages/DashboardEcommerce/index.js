import React from "react";
import { Container } from "reactstrap";

import { Button } from "antd";
import ImageUploadModal from "../../Components/Common/modal/FileUploadModal";

const DashboardEcommerce = () => {
  document.title = "Dashboard | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* <h1 className="bg-primary">Addres Shop</h1> */}
          {/* <Button onClick={() => { console.log("Hello"); }}>
            Upload image
          </Button> */}

          <ImageUploadModal />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardEcommerce;
