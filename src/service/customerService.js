import ApiService from "./apiService";

export async function getAllCustomers(currentPage) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}

// export async function searchCustomers(data, currentPage) {
//     const apiObject = {};
//     apiObject.method = "GET";
//     apiObject.authentication = true;
//     apiObject.isWithoutPrefix = false;
//     apiObject.endpoint = `customers/search/${data.searchTerm}`;
//     apiObject.body = null;
//     return await ApiService.callApi(apiObject);
// }

export async function getCustomerById(cusId) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers/${cusId}`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}

export async function updateCustomer(cusId, data) {
    const apiObject = {};
    apiObject.method = "PUT";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers/${cusId}`;
    apiObject.body = data;
    return await ApiService.callApi(apiObject);
}

export async function deleteCustomer(cusId) {
    const apiObject = {};
    apiObject.method = "PUT";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers/${cusId}`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}
export const searchCustomers = (searchTerm) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `customers/search/${searchTerm}`;
    return ApiService.callApi(apiObject);
};

export const createCustomer = (customerData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `customers`;
    apiObject.body = customerData;
    return ApiService.callApi(apiObject);
};