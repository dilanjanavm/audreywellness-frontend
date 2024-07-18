import ApiService from "./apiService";

export async function searchFiltration(page = 1, status = '', orderCode = '', customerName = '', email = '', trackingId = '', orderDate = '') {
    const apiObject = {
        method: "GET",
        authentication: true,
        endpoint: `api/admin/payment/find-all?perPage=5&page=${page}&orderCode=${orderCode}&customerName=${customerName}&email=${email}&trackingId=${trackingId}&status=${status}&orderDate=${orderDate}`
    };
    return await ApiService.callApi(apiObject);
}