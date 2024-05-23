import ApiService from "./apiService";

export async function upload(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/files/upload";
  apiObject.multipart = true;
  apiObject.body = data;
  console.log(apiObject, "apii object");
  return await ApiService.callApi(apiObject);
}

export async function getAll() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/files/find-all";
  return await ApiService.callApi(apiObject);
}
