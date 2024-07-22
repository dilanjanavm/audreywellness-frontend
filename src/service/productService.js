import ApiService from "./apiService";

// export async function getAllProducts() {
//   const apiObject = {};
//   apiObject.method = "GET",
//   apiObject.authentication = true,
//   apiObject.isWithoutPrefix = false;
//   apiObject.endpoint = `api/product/find-all?perPage=${15}&page=${currentPage}`;
//   apiObject.body = null;
//   return await ApiService.callApi(apiObject);
// }

export async function addNewProduct(data) {
  const apiObject = {};
  apiObject.method = "POST",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/product/create`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateProduct(productId, data) {
  const apiObject = {};
  apiObject.method = "PUT",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteProduct(productId) {
  const apiObject = {};
  apiObject.method = "DELETE",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function checkProductNameExists(productName) {
  const apiObject = {};
  apiObject.method = "GET",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/product/find-by-name/${productName}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function activeInactiveProduct(productId, status) {
  const apiObject = {};
  apiObject.method = "PATCH",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

// export async function productsFiltration(data, currentPage) {
//   const apiObject = {};
//   apiObject.method = "GET";
//   apiObject.authentication = true;
//   apiObject.isWithoutPrefix = false;
//   apiObject.endpoint = `api/product/find-all?name=${data.name}&category=${data.category}&status=${data.status}&perPage=${15}&page=${currentPage}`;
//   apiObject.body = null;
//   return await ApiService.callApi(apiObject);
// }
