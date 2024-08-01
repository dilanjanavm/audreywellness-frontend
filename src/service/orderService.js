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

export async function updateOrdersStatus(orderId, status) {
  const apiObject = {};
  apiObject.method = "PATCH",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/order/update-status/${orderId}?status=${status}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function updateTrackingCode(orderId, trackingCode) {
  const apiObject = {};
  apiObject.method = "PATCH",
  apiObject.authentication = true,
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/order/update-trackingCode/${orderId}?trackingCode=${trackingCode}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function ordersFiltration(data,currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/order/find-all?orderCode=${data?.orderCode}&trackingCode=${data?.trackingCode}&cusName=${data?.cusName}&contact=${data?.contact}&orderStartDate=${data?.startDate}&orderEndDate=${data?.endDate}&status=${data?.status}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}