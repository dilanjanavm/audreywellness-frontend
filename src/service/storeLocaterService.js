import ApiService from "./apiService";

export async function getAllStores(currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/store-locator/find-all?perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function createStore(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/store-locator/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateStore(storeId, data) {
  const apiObject = {};
  apiObject.method = "PUT";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteStore(storeId) {
  const apiObject = {};
  apiObject.method = "DELETE",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getAllStoreFiltration(data, currentPage) {
  const apiObject = {};
  apiObject.method = "GET",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/store-locator/find-all?postalCode=${data.postalCode}&city=${data.city}&address=${data.address}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
