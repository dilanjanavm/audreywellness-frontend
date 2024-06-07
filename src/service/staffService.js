import ApiService from "./apiService";

export async function getAll() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/staff/find-all";
  return await ApiService.callApi(apiObject);
}

export async function create(data) {
  console.log(data);
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/staff/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function update(staffId, data) {
  console.log(staffId, "===========", data, "dataaa");
  const apiObject = {};
  apiObject.method = "PUT";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/staff/update/${staffId}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}
