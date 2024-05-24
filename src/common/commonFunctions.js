import { Fragment } from "react";
import { Slide, toast, ToastContainer } from "react-toastify";
import Avatar from "../Components/Common/avatar/index";
import { AlertTriangle, Check, X } from "react-feather";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../assets/scss/components/customeToastify.scss";
import { Upload, message, Card as AntCard } from "antd";
export const MySwal = withReactContent(Swal);

import Cookies from "js-cookie";

const ToastContent = ({ title, body, assets }) => (
  <Fragment>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />

    <ToastContainer />
  </Fragment>
);

export const customToastMsg = (e, type, c) => {
  let msgType = "info";
  let assets = {
    color: "bg-info",
    icon: <AlertTriangle color={"#3f3d3d"} size={15} />,
  };
  if (type === 2) {
    msgType = "info";
    assets = {
      color: "bg-warning",
      icon: <AlertTriangle color={"#3f3d3d"} size={15} />,
    };
  } else if (type === 0) {
    msgType = "error";
    assets = {
      color: "bg-danger",
      icon: <X size={15} color={"#680000"} />,
    };
  } else if (type === 1) {
    msgType = "success";
    assets = {
      color: "bg-success",
      icon: <Check color={"#10df10"} size={15} />,
    };
  }

  toast[msgType](e, {
    position: "top-right",
    autoClose: true,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

// export const customToastMsg = (title, type, body) => {
//     console.log('customToastMsg')
//     let msgType = "info"
//     let assets = {
//         color: "bg-info",
//         icon: <AlertTriangle color={'#3f3d3d'} size={15}/>
//     }
//
//     if (type === 2) {
//         msgType = "info"
//         assets = {
//             color: "bg-warning",
//             icon: <AlertTriangle color={'#3f3d3d'} size={15}/>
//         }
//     } else if (type === 0) {
//         msgType = "error"
//         assets = {
//             color: "bg-danger",
//             icon: <X size={15} color={'#680000'}/>
//         }
//     } else if (type === 1) {
//         msgType = "success"
//         assets = {
//             color: "bg-success",
//             icon: <Check color={'#10df10'} size={15}/>
//         }
//     }
//
//     toast[msgType](
//         <ToastContent title={title} body={body} assets={assets}/>,
//         {icon: false, transition: Slide, hideProgressBar: true, autoClose: 2000}
//     )
// }

export const isEmpty = (str) => {
  return !str || str.length === 0;
};

export const customSweetAlert = (
  text,
  type,
  buttonEvent,
  textInputProps,
  title
) => {
  let msgType = "warning";
  if (type === 2) {
    msgType = "info";
  } else if (type === 0) {
    msgType = "error";
  } else if (type === 1) {
    msgType = "success";
  } else if (type === 3) {
    msgType = "warning";
  }

  return MySwal.fire({
    title,
    text,
    icon: msgType,
    showCancelButton: true,
    confirmButtonText: "Yes",
    customClass: {
      confirmButton: "btn btn-primary mx-3",
      cancelButton: "btn btn-outline-danger",
      content: "pt-1 pb-1",
      input: "mb-1 form-control alert-input-label",
      inputLabel: "mt-2 font-weight-bold",
    },
    buttonsStyling: false,
    input: textInputProps && textInputProps.enabled ? "textarea" : null,
    inputLabel: textInputProps ? textInputProps.inputLabel : null,
    inputPlaceholder: textInputProps ? textInputProps.placeholder : null,
    inputValidator: (value) => {
      if (!value) {
        return textInputProps.errorMsg;
      }
    },
  }).then(function (result) {
    if (result.value) {
      buttonEvent(result.value);
    }
  });
};

export const customSweetAlertResolve = (
  text,
  type,
  buttonEvent,
  textInputProps,
  title,
  yesText
) => {
  let msgType = "warning";
  if (type === 2) {
    msgType = "info";
  } else if (type === 0) {
    msgType = "error";
  } else if (type === 1) {
    msgType = "success";
  }

  return MySwal.fire({
    title,
    text,
    icon: msgType,
    showCancelButton: true,
    confirmButtonText: yesText,
    customClass: {
      confirmButton: "btn btn-primary mr-2",
      cancelButton: "btn btn-outline-danger",
      content: "pt-1 pb-1",
      input: "mb-1 form-control alert-input-label",
      inputLabel: "mt-2 font-weight-bold",
    },
    buttonsStyling: false,
    input: textInputProps && textInputProps.enabled ? "textarea" : null,
    inputLabel: textInputProps ? textInputProps.inputLabel : null,
    inputPlaceholder: textInputProps ? textInputProps.placeholder : null,
    inputValidator: (value) => {
      if (!value) {
        return textInputProps.errorMsg;
      }
    },
  }).then(function (result) {
    if (result.value) {
      buttonEvent(result.value);
    }
  });
};

export const handleError = (c) => {
  // c?.response?.data?.message
  //   ? customToastMsg(c?.response?.data?.message[0], 0)
  //   : customToastMsg("Sorry! Try again later", 0);
  message.error(c?.response?.data?.message[0]);
};

export const countDescription = (description) => {
  if (description === "") return 0;
  // Remove HTML tags using regular expression
  var strippedString = description.replace(/(<([^>]+)>)/gi, "");

  // Count actual characters
  var characterCount = strippedString.length;

  return characterCount;
};
