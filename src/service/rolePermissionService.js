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
export async function getAllRoles(status) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-all?status=${status}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}

export async function getRoleByIdWithOrWithoutPermission(id, withPermissions) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/role/find-by-id/${id}?withPermission=${withPermissions}`;
  const result = await ApiService.callApi(apiObject);
  return result;
}

export async function deleteRole(roleId) {
  // const apiObject = {};
  // apiObject.method = "GET";
  // apiObject.authentication = true;
  // apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  // const result = await ApiService.callApi(apiObject);
  // return result;
}

export async function update(roleId, data) {
  // const apiObject = {};
  // apiObject.method = "GET";
  // apiObject.authentication = true;
  // apiObject.endpoint = `api/role/find-all?withPermission=${withPermission}`;
  // const result = await ApiService.callApi(apiObject);
  // return result;
}

export async function assigneRolePermission(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/role-permission/assigne";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

// export async function getAllPermissions() {}
