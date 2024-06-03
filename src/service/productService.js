import ApiService from "./apiService";

export async function getAllProducts() {
  const apiObject = {};
  (apiObject.method = "GET"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/product/find-all`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function addNewProduct(data) {
  const apiObject = {};
  (apiObject.method = "POST"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/admin/product/create`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateProduct(productId, data) {
  const apiObject = {};
  (apiObject.method = "PUT"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = ``;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteProduct(productId) {
  const apiObject = {};
  (apiObject.method = "DELETE"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}


export async function getProductDetailsById(productId) {
  const apiObject = {};
  (apiObject.method = "GET"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/product-variant/find-all-by-product-id/${productId}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}


export async function activeInactiveProduct(productId, status) {
  const apiObject = {};
  (apiObject.method = "PATCH"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

// export async function searchProductsFiltration(data, currentPage) {
//   const apiObject = {};
//   apiObject.method = "GET";
//   apiObject.authentication = true;
//   apiObject.isWithoutPrefix = false;
//   apiObject.endpoint = `api/product/get-all-products?name=${
//     data.name
//   }&category=${data.category}&status=${
//     data.status
//   }&limit=${24}&pages=${currentPage}`;
//   apiObject.body = null;
//   return await ApiService.callApi(apiObject);
// }
