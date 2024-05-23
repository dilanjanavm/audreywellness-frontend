import ApiService from "./apiService";

export async function create(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/files/upload";
  apiObject.multipart = true;
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
