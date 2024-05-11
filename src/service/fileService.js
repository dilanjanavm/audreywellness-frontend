import ApiService from "./apiService";

export async function upload(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/v1/files/upload";
  apiObject.multipart = true;
  apiObject.body = data;
  console.log(apiObject, "apii object");
  return await ApiService.callApi(apiObject);
}
