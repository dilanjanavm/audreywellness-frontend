//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

import {
  loginSuccess,
  logoutUserSuccess,
  apiError,
  reset_login_flag,
} from "./reducer";
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
        console.log('Login response:', res);
        
        // Store tokens
        Cookies.set(constant.ACCESS_TOKEN, res.data.access_token);
        Cookies.set(constant.REFRESH_TOKEN, res.data.refresh_token);
        
        // Store user data with permissions in sessionStorage
        const userData = res.data.user || {};
        sessionStorage.setItem("authUser", JSON.stringify(userData));
        
        // Dispatch login success with user and permissions
        dispatch(loginSuccess({
          user: userData,
          permissions: userData.permissions || []
        }));
        
        // Check if there's a saved redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/login') {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
        } else {
          // Redirect to dashboard
          window.location.href = "/dashboard";
        }
      })
      .catch((error) => {
        console.log(error?.response);
        const errorMessage = error?.response?.data?.message 
          ? (Array.isArray(error.response.data.message) 
              ? error.response.data.message[0] 
              : error.response.data.message)
          : "Login failed. Please check your credentials.";
        customToastMsg(errorMessage, 0);
      });
  } catch (error) {
    console.log(error);
    const errorMessage = error?.response?.data?.message 
      ? (Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message)
      : "Login failed. Please try again.";
    customToastMsg(errorMessage, 0);
    // dispatch(apiError(error));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // Clear cookies
    Cookies.remove(constant.ACCESS_TOKEN);
    Cookies.remove(constant.REFRESH_TOKEN);
    Cookies.remove(constant.Expire_time);
    
    // Clear sessionStorage (including user data and permissions)
    sessionStorage.removeItem("authUser");
    
    // Update Redux state
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
