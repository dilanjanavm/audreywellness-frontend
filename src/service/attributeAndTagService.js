import ApiService from "./apiService";

export async function getAllAttributesWithTags(withTag, currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/attributes/find-all?withTag=true&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function createAttributesWithTags(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/attributes/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateAttributesWithTags(data, attId) {
  const apiObject = {};
  apiObject.method = "";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteAttributesWithTags(attId) {
  const apiObject = {};
  apiObject.method = "DELETE",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function attributesWithTagsFiltration(
  withTag,
  name,
  status,
  currentPage
) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/attributes/find-all?withTag=${withTag}&name=${name}&status=${status}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
