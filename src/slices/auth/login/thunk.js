//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

import {
  loginSuccess,
  logoutUserSuccess,
  apiError,
  reset_login_flag,
} from "./reducer";
import { loginService } from "../../../service/auth";
import * as authService from "../../../service/auth";
import * as constant from "../../../common/constants";
import Cookies from "js-cookie";
import { customToastMsg } from "../../../common/commonFunctions";

export const loginUser = (user, history) => async (dispatch) => {
  try {
    let userDetails = {
      username: user.email,
      password: user.password,
      // "client_secret": constant.Client_Secret,
    };
    authService
      .login(userDetails)
      .then((res) => {
        console.log(res);
        Cookies.set(constant.ACCESS_TOKEN, res.access_token);
        Cookies.set(constant.REFRESH_TOKEN, res.refresh_token);
        Cookies.set(constant.Expire_time, res.expire_time);
        window.location.href = "/dashboard";
        console.log(res);
        sessionStorage.setItem("authUser", JSON.stringify(res.data));
        // dispatch(loginSuccess(tempVariable));
      })
      .catch((c) => {
        console.log(c.response.data.message[0]);
        customToastMsg(c.response.data.message[0], 0);
      });
  } catch (error) {
    console.log(error);
    customToastMsg(c.response.data.message, 0);
    // dispatch(apiError(error));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    Cookies.remove(constant.ACCESS_TOKEN);
    Cookies.remove(constant.REFRESH_TOKEN);
    Cookies.remove(constant.Expire_time);
    dispatch(logoutUserSuccess(true));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const socialLogin = (type, history) => async (dispatch) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }
    //  else {
    //   response = postSocialLogin(data);
    // }

    const socialdata = await response;
    if (socialdata) {
      sessionStorage.setItem("authUser", JSON.stringify(response));
      dispatch(loginSuccess(response));
      history("/dashboard");
    }
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const resetLoginFlag = () => async (dispatch) => {
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};
