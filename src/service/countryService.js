import ApiService from "./apiService";

export async function getAllCountries() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/country/find-all";
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
