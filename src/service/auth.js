import ApiService from "./apiService";
import apiConfig from "./apiConfig";
export async function login(userCredentials) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/auth/login/email/${apiConfig.adminPrefix}`;
  apiObject.body = userCredentials;
  return await ApiService.callApi(apiObject);
}

export async function resetPasswordConfirmEmail(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/password/forgot-password";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function resetPasswordDetailsWithOtp(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/password/check-otp-for-reset";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

//------------------------------------------------------------------------------

export async function changeFirstTimePassword(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.endpoint = "reset-default-password";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function renewToken(token) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.endpoint = "auth/refresh";
  apiObject.body = token;
  apiObject.state = "refresh_token";
  return await ApiService.callApi(apiObject);
}

export async function verifyOtp(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.endpoint = "forgot-password/verify-otp";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function requestOTP(email) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.endpoint = "forgot-password/request-otp";
  apiObject.body = email;
  return await ApiService.callApi(apiObject);
}
