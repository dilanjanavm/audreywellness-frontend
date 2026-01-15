import ApiService from "./apiService";
import axios from 'axios';
import apiConfig from './apiConfig';
import Cookies from "js-cookie";
import * as constants from "../common/constants";


export async function getAllCustomers(page = 1, limit = 10, filters = {}) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;

    // Build query parameters - match backend endpoint structure
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    // Add search parameter (backend uses 'search' not 'searchTerm')
    if (filters.search) {
        queryParams.append('search', filters.search);
    }

    // Add filter parameters (only non-empty values)
    if (filters.status) {
        queryParams.append('status', filters.status);
    }
    if (filters.customerType) {
        queryParams.append('customerType', filters.customerType);
    }
    if (filters.salesType) {
        queryParams.append('salesType', filters.salesType);
    }
    if (filters.cityArea) {
        queryParams.append('cityArea', filters.cityArea);
    }

    apiObject.endpoint = `customers?${queryParams.toString()}`;
    apiObject.body = null;
    return await ApiService.callApi(apiObject);
}

export async function getAllCustomersDrp( ) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.isWithoutPrefix = false;
    apiObject.endpoint = `customers`;
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

export const exportCustomersCSV = (filters = {}) => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add filter parameters (only non-empty values)
    if (filters.cityArea) {
        queryParams.append('cityArea', filters.cityArea);
    }
    if (filters.status) {
        queryParams.append('status', filters.status);
    }
    if (filters.customerType) {
        queryParams.append('customerType', filters.customerType);
    }
    if (filters.salesType) {
        queryParams.append('salesType', filters.salesType);
    }
    if (filters.search) {
        queryParams.append('search', filters.search);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `customers/export/csv${queryString ? `?${queryString}` : ''}`;
    const url = `${apiConfig.serverUrl}/${endpoint}`;
    
    // Get access token
    const access_token = Cookies.get(constants.ACCESS_TOKEN);
    
    return axios({
        method: 'GET',
        url: url,
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
        responseType: 'blob', // Important for file downloads
    });
};