import ApiService from "./apiService";

export async function getAllProductBaseVariation(currentPage) {
  const apiObject = {};
  apiObject.method = "GET",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/product-base-variant/find-all?perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getProductBaseVariationDetailsById(productId) {
  const apiObject = {};
  apiObject.method = "GET",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/product-base-variant/find-by-id/${productId}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function productBaseVariationFiltration(data,currentPage) {
  const apiObject = {};
  apiObject.method = "GET",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/product-base-variant/find-all?name=${data.name}&category=${data.category}&status=${data.status}perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}