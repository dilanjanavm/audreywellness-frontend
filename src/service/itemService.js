// src/service/itemService.js

import ApiService from "./apiService";

export const getAllItems = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items`;
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
    apiObject.body = { itemCodes };
    return ApiService.callApi(apiObject);
};

export const importItemsFromCSV = (csvContent) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/import`;
    apiObject.body = { csvContent };
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

export const searchItems = (searchTerm) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/search/${searchTerm}`;
    return ApiService.callApi(apiObject);
};

export const getItemsByCategory = (categoryId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `items/category/${categoryId}`;
    return ApiService.callApi(apiObject);
};