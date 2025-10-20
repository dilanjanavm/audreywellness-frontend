import ApiService from "./apiService";

export const getAllCategories = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `categories`;
    return ApiService.callApi(apiObject);
};

export const getCategoryById = (categoryId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `categories/${categoryId}`;
    return ApiService.callApi(apiObject);
};

export const createCategory = (categoryData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `categories`;
    apiObject.body = categoryData;
    return ApiService.callApi(apiObject);
};

export const updateCategory = (categoryId, categoryData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `categories/${categoryId}`;
    apiObject.body = categoryData;
    return ApiService.callApi(apiObject);
};

export const deleteCategory = (categoryId) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `categories/${categoryId}`;
    return ApiService.callApi(apiObject);
};