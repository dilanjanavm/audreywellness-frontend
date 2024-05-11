import ApiService from "./apiService";

export async function getAll() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/customer/find-all";
  return await ApiService.callApi(apiObject);
}
