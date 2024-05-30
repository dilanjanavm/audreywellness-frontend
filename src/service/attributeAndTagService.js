import ApiService from "./apiService";

export async function getAllAttributesWithTags(withTag) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/attributes/find-all?withTag=true";
  return await ApiService.callApi(apiObject);
}

export async function create(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/attributes/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}
