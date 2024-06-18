import ApiService from "./apiService";

export async function getAllOrders() {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = "api/admin/order/find-all";
  return await ApiService.callApi(apiObject);
}

export async function getOrderByOrderId(orderId) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.endpoint = `api/admin/order/find-by-id/${orderId}`;
  return await ApiService.callApi(apiObject);
}
export async function updateOrdersStatus(orderId, data) {
  const apiObject = {};
  (apiObject.method = "PUT"),
    (apiObject.authentication = true),
    (apiObject.isWithoutPrefix = false);
  apiObject.endpoint = `api/order/update-status/${orderId}`;
  apiObject.body = data;
  return await ApiService.callApi(apiObject);
}
