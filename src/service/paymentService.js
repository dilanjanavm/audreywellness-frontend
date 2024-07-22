import ApiService from "./apiService";

export async function getAllPayments(currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/payment/find-all?perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function paymentsFiltration(data,currentPage) {
  const apiObject = {};
  apiObject.method = "GET";
  apiObject.authentication = true;
  apiObject.isWithoutPrefix = false;
  apiObject.endpoint = `api/admin/payment/find-all?orderCode=${data?.orderCode}&customerName=${data?.customerName}&email=${data?.email}&trackingId=${data?.trackingId}&status=${data?.status}&orderStartDate=${data?.orderStartDate}&orderEndDate=${data?.orderEndDate}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}

export async function searchFiltration(
  page = 1,
  status = "",
  orderCode = "",
  customerName = "",
  email = "",
  trackingId = "",
  orderDate = ""
) {
  const apiObject = {
    method: "GET",
    authentication: true,
    endpoint: `api/admin/payment/find-all?perPage=5&page=${page}&orderCode=${orderCode}&customerName=${customerName}&email=${email}&trackingId=${trackingId}&status=${status}&orderDate=${orderDate}`,
  };
  return await ApiService.callApi(apiObject);
}
