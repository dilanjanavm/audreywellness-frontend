import ApiService from "./apiService";

export async function createRole(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/role/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}
export async function getAllRoles(withPermission) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}

export async function deleteRole(roleId) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}

export async function update(roleId, data) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}

export async function getAllPermissions() {}
