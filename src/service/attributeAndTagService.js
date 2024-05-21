import ApiService from "./apiService";

export async function getAllAttributesWithTags() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/attributes/find-all?withTag=true";
  return await ApiService.callApi(apiObject);
}
