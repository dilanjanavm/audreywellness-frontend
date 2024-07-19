import ApiService from "./apiService";

export async function getAllCategoriesWithSubCategories() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint =
    "api/category/find-all-parent-categories?withSubCategories=true";
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getAllCategoriesWithOrWithoutSubCategories(
  withSubCategories
) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/category/find-all-parent-categories?withSubCategories=${withSubCategories}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getAllCategories(currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/category/find-all?perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function createCategory(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/category/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function updateCategory(id, data) {
  const apiObject = {};
  apiObject.method = "PUT";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/category/update/${id}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteCategory(catId) {
  const apiObject = {};
  (apiObject.method = "DELETE"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = ``;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function categoryFiltration(data, currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/category/find-all?name=${data?.name}&status=${
    data?.status
  }&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
