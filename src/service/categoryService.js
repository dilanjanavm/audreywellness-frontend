import ApiService from "./apiService";

export async function getAllCategoriesWithSubCategories() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/category/find-all?withSubCategories=true";
  return await ApiService.callApi(apiObject);
}
