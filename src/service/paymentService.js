import ApiService from "./apiService";
import axios from "axios";

export async function getAllPayments(currentPage, status) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `api/admin/payment/find-all?perPage=5&page=${currentPage}&status=${status}`;
    return await ApiService.callApi(apiObject);
}

/* export async function getAllPaymentsWithStatus(status) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `api/admin/payment/find-all?perPage=5&page=1&status=${status}`;
    console.log(apiObject.endpoint);
    return await ApiService.callApi(apiObject);
} */

/* export async function getPaymentsByPage(pageNumber) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `api/admin/payment/find-all?perPage=5&page=${pageNumber}`;
    return await ApiService.callApi(apiObject);
} */

/* export const getAllPaymentsWithStatus = async (currentPage, filters) => {
    const response = await axios.get('api/admin/payment/find-all', {
        params: {
            perPage: 5,
            page: currentPage,
            ...filters,
        },
    });
    return response.data;
};
 */