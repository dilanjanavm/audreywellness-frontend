import ApiService from "./apiService";

export async function getAllCategoriesWithSubCategories() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint =
    "api/category/find-all-parent-categories?withSubCategories=true";
  return await ApiService.callApi(apiObject);
}

export async function getAllCategoriesWithOrWithoutSubCategories(
  withSubCategories
) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint =
    "api/category/find-all-parent-categories?withSubCategories=false";
  return await ApiService.callApi(apiObject);
}

export async function getAllCategories() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/category/find-all";
  return await ApiService.callApi(apiObject);
}

export async function create(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/category/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function update(id, data) {
  const apiObject = {};
  apiObject.method = "PUT";
  apiObject.authentication = false;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/category/update/${id}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}
