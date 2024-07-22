import ApiService from "./apiService";

export async function getAllOrders(currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/order/find-all?perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function getOrderByOrderId(orderId) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/order/find-by-id/${orderId}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function updateOrdersStatus(orderId, data) {
  const apiObject = {};
  apiObject.method = "PUT",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/order/update-status/${orderId}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}

export async function ordersFiltration(data,currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/order/find-all?orderId=${data?.orderId}&cusName=${data?.name}&contact=${data?.contactNo}&orderStartDate=${data?.ordStartDate}&orderEndDate=${data?.ordEndDate}&status=${data?.status}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}