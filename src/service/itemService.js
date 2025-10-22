// src/service/itemService.js

import ApiService from "./apiService";

export const getAllItems = (page = 1, limit = 50, search, category) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;

    // Build query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    });
    console.log(search)
    if (search) {
        queryParams.append('search', search);
    }

    if (category) {
        queryParams.append('category', category);
    }

    apiObject.endpoint = `items?${queryParams.toString()}`;
    return ApiService.callApi(apiObject);
};

//import items
export const importItemsFromCSVFile = (file) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/import/upload`;
    apiObject.isMultipart = true;

    const formData = new FormData();
    formData.append('file', file.originFileObj || file);
    console.log(formData)
    apiObject.body = formData;

    return ApiService.callApi(apiObject);
};

export const downloadCsvTemplate = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/export/template`;
    return ApiService.callApi(apiObject);
};

// Keep other functions the same...
export const searchItems = (searchTerm) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/search/${searchTerm}`;
    return ApiService.callApi(apiObject);
};

export const getItemById = (itemCode) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/${itemCode}`;
    return ApiService.callApi(apiObject);
};

export const createItem = (itemData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items`;
    apiObject.body = itemData;
    return ApiService.callApi(apiObject);
};

export const updateItem = (itemCode, itemData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `items/${itemCode}`;
    apiObject.body = itemData;
    return ApiService.callApi(apiObject);
};

export const deleteItem = (itemCode) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `items/${itemCode}`;
    return ApiService.callApi(apiObject);
};

export const bulkDeleteItems = (itemCodes) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/bulk-remove`;
    apiObject.body = {itemCodes};
    return ApiService.callApi(apiObject);
};

export const importItemsFromCSV = (csvContent) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/import`;
    apiObject.body = {csvContent};
    return ApiService.callApi(apiObject);
};

export const exportItemsToCSV = (options = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/export/csv`;
    apiObject.params = options;
    return ApiService.callApi(apiObject);
};


export const getItemsByCategory = (categoryId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/category/${categoryId}`;
    return ApiService.callApi(apiObject);
};