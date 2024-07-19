import ApiService from "./apiService";

export async function getAllBanners() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/banner/find-all";
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function createBanner(data) {
  const apiObject = {};
  apiObject.method = "POST";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = "api/banner/create";
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function deleteBanner(bannerId) {
  const apiObject = {};
  apiObject.method = "DELETE";
  apiObject.authentication = true;
  apiObject.urlencoded = false;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/banner/delete/${bannerId}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
