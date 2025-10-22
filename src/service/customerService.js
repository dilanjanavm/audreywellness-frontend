import ApiService from "./apiService";


export async function getAllCustomers(page = 1, limit = 10, filters = {}) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;

    // Build query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
    });

    apiObject.endpoint = `customers?${queryParams.toString()}`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}

export async function getCustomerById(cusId) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers/${cusId}`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}

export async function getCustomerBySNo(sNo) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers/sno/${sNo}`;
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
    apiObject.method = "DELETE";
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


export const importCustomersFromCSV = (file) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `customers/import-csv`;
    apiObject.isMultipart = true;
    const formData = new FormData();
    formData.append('file', file.originFileObj || file);

    apiObject.body = formData;

    return ApiService.callApi(apiObject);
};

export const getCustomerComplaints = (customerId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `customers/${customerId}/complaints`;
    return ApiService.callApi(apiObject);
};