import ApiService from "./apiService";

export async function getAllProductBaseVariation() {
  const apiObject = {};
  (apiObject.method = "GET"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/admin/product-base-variant/find-all`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getProductBaseVariationDetailsById(productId) {
  const apiObject = {};
  (apiObject.method = "GET"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/admin/product-base-variant/find-by-id/${productId}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
