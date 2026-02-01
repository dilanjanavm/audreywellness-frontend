import ApiService from "./apiService";

export async function upload(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/files/upload";
  apiObject.multipart = true;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function getAllFiles() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/files/find-all";
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
