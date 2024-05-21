import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

//import Scss
import "./assets/scss/themes.scss";

//imoprt Route
import Route from "./Routes";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <React.Fragment>
      <Route />
    </React.Fragment>
  );
}

export default App;
