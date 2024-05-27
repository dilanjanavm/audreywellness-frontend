import ApiService from "./apiService";

export async function getAllCategoriesWithSubCategories() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/category/find-all?withSubCategories=true";
  return await ApiService.callApi(apiObject);
}

export async function getAllCategoriesWithOrWithoutSubCategories(
  withSubCategories
) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/category/find-all?withSubCategories=false";
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
