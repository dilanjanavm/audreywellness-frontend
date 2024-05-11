import ApiService from "./apiService";

export async function getAllRoles(withPermission) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}
