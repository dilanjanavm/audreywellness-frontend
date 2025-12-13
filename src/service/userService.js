// src/service/userService.js

import ApiService from "./apiService";

// User Management APIs

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise}
 */
export const createUser = (data) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = 'users';
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Get all users
 * @returns {Promise}
 */
export const getAllUsers = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = 'users';
    return ApiService.callApi(apiObject);
};

/**
 * Get user by ID
 * @param {string} id - User UUID
 * @returns {Promise}
 */
export const getUserById = (id) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `users/${id}`;
    return ApiService.callApi(apiObject);
};

/**
 * Update user
 * @param {string} id - User UUID
 * @param {Object} data - Updated user data
 * @returns {Promise}
 */
export const updateUser = (id, data) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `users/${id}`;
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Delete user (soft delete)
 * @param {string} id - User UUID
 * @returns {Promise}
 */
export const deleteUser = (id) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `users/${id}`;
    return ApiService.callApi(apiObject);
};
