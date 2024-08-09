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



export async function updateSetting(settingId, data) {
  const apiObject = {};
  apiObject.method = "PUT",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/setting/update/${settingId}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}