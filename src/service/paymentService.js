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
  apiObject.endpoint = `api/admin/payment/find-all?orderCode=${data?.orderCode}&email=${data?.email}&trackingCode=${data?.trackingCode}&paymentStartDate=${data?.startDate}&paymentEndDate=${data?.endDate}&orderStatus=${data?.OrderStatus}&paymentStatus=${data?.PaymentStatus}&perPage=${15}&page=${currentPage}`;
  apiObject.body = null;
  return await ApiService.callApi(apiObject);
}
