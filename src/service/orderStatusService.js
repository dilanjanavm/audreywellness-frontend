import ApiService from "./apiService";

export async function getAllOrderStatus() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/order-status/find-all";
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
