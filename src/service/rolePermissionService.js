import ApiService from "./apiService";

export async function getAllRoles(status) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/role/find-all?status=${status}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function createRole(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/role/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateRole(roleId, data) {
  const apiObject = {};
  apiObject.method = "PUT";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/role/update/${roleId}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteRole(roleId) {
  const apiObject = {};
  apiObject.method = "DELETE",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getRoleByIdWithOrWithoutPermission(id, withPermissions) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/role/find-by-id/${id}?withPermission=${withPermissions}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function assignRolePermission(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/role-permission/assigne";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

