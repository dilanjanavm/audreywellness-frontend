// src/service/userService.js

import ApiService from "./apiService";

export const getAllUsers = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `users`; // Adjust endpoint as needed
    return ApiService.callApi(apiObject);
};