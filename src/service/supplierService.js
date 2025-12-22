// src/service/supplierService.js

import ApiService from "./apiService";

export const getAllSuppliers = (page = 1, limit = 10, search = '', active = true, includeItems = false) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (active !== undefined && active !== null) queryParams.append('active', active.toString());
    if (includeItems) queryParams.append('includeItems', 'true');
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `suppliers${queryString ? `?${queryString}` : ''}`;
    
    return ApiService.callApi(apiObject);
};

export const getSupplierById = (id, includeItems = false) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    const queryParam = includeItems ? '?includeItems=true' : '';
    apiObject.endpoint = `suppliers/${id}${queryParam}`;
    return ApiService.callApi(apiObject);
};

export const getSupplierByReference = (reference, includeItems = false) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    const queryParam = includeItems ? '?includeItems=true' : '';
    apiObject.endpoint = `suppliers/reference/${reference}${queryParam}`;
    return ApiService.callApi(apiObject);
};

export const createSupplier = (supplierData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers`;
    apiObject.body = supplierData;
    return ApiService.callApi(apiObject);
};

export const updateSupplier = (id, supplierData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/${id}`;
    apiObject.body = supplierData;
    return ApiService.callApi(apiObject);
};

export const deleteSupplier = (id) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/${id}`;
    return ApiService.callApi(apiObject);
};

export const getSupplierStats = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/stats`;
    return ApiService.callApi(apiObject);
};

export const getSupplierItems = (supplierId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/${supplierId}/items`;
    return ApiService.callApi(apiObject);
};

export const addItemsToSupplier = (supplierId, itemIds) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/${supplierId}/items`;
    apiObject.body = { itemIds };
    return ApiService.callApi(apiObject);
};

export const removeItemsFromSupplier = (supplierId, itemIds) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/${supplierId}/items`;
    apiObject.body = { itemIds };
    return ApiService.callApi(apiObject);
};

export const getSuppliersByItem = (itemId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/items/${itemId}/suppliers`;
    return ApiService.callApi(apiObject);
};

export const importSuppliersCSV = (file) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/import-csv`;
    apiObject.isMultipart = true;
    const formData = new FormData();
    formData.append('file', file.originFileObj || file);
    apiObject.body = formData;
    return ApiService.callApi(apiObject);
};

export const exportSuppliersCSV = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `suppliers/export/csv`;
    return ApiService.callApi(apiObject);
};