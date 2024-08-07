import ApiService from "./apiService";

export async function getAllSettings() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/setting/find-all`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
