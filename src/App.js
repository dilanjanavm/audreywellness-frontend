import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ConfigProvider } from "antd";
//import Scss
import "./assets/scss/themes.scss";

//imoprt Route
import Route from "./Routes";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <React.Fragment>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: "#458533",
            colorPrimaryHover:"#69af57",
            borderRadius: 5,
            activeBg: "#124585",
            optionSelectedBg: "#e6f4ff",
            controlItemBgHover: "#e6f4ff",
          },
        }}
      >
        <Route />
      </ConfigProvider>
    </React.Fragment>
  );
}

export default App;
