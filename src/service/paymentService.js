import ApiService from "./apiService";

export async function getAllPayments(currentPage) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `api/admin/payment/find-all?perPage=5&page=${currentPage}`;
    return await ApiService.callApi(apiObject);
}

/* export async function getPaymentsByPage(pageNumber) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `api/admin/payment/find-all?perPage=5&page=${pageNumber}`;
    return await ApiService.callApi(apiObject);
} */