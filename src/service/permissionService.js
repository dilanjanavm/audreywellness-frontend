// src/service/permissionService.js

import ApiService from "./apiService";

// Permission Management APIs

/**
 * Create a new permission
 * @param {Object} data - Permission data
 * @returns {Promise}
 */
export const createPermission = (data) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = 'permissions';
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Get all permissions
 * @param {string} module - Optional module filter
 * @returns {Promise}
 */
export const getAllPermissions = (module = null) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    const endpoint = module ? `permissions?module=${module}` : 'permissions';
    apiObject.endpoint = endpoint;
    return ApiService.callApi(apiObject);
};

/**
 * Get permission by ID
 * @param {string} id - Permission UUID
 * @returns {Promise}
 */
export const getPermissionById = (id) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `permissions/${id}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get permissions by module
 * @param {string} module - Module name
 * @returns {Promise}
 */
export const getPermissionsByModule = (module) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `permissions/module/${module}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get all permissions grouped by module
 * @returns {Promise}
 */
export const getPermissionsGroupedByModule = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = 'permissions/grouped/by-module';
    return ApiService.callApi(apiObject);
};

/**
 * Update permission
 * @param {string} id - Permission UUID
 * @param {Object} data - Updated permission data
 * @returns {Promise}
 */
export const updatePermission = (id, data) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `permissions/${id}`;
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Delete permission (hard delete)
 * @param {string} id - Permission UUID
 * @returns {Promise}
 */
export const deletePermission = (id) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `permissions/${id}`;
    return ApiService.callApi(apiObject);
};

