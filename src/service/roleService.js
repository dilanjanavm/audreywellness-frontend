// src/service/roleService.js

import ApiService from "./apiService";

// Role Management APIs

/**
 * Create a new role
 * @param {Object} data - Role data
 * @returns {Promise}
 */
export const createRole = (data) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = 'roles';
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Get all roles
 * @returns {Promise}
 */
export const getAllRoles = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = 'roles';
    return ApiService.callApi(apiObject);
};

/**
 * Get role by ID
 * @param {string} id - Role UUID
 * @returns {Promise}
 */
export const getRoleById = (id) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `roles/${id}`;
    return ApiService.callApi(apiObject);
};

/**
 * Update role
 * @param {string} id - Role UUID
 * @param {Object} data - Updated role data
 * @returns {Promise}
 */
export const updateRole = (id, data) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `roles/${id}`;
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Delete role (soft delete)
 * @param {string} id - Role UUID
 * @returns {Promise}
 */
export const deleteRole = (id) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `roles/${id}`;
    return ApiService.callApi(apiObject);
};

/**
 * Assign permissions to role
 * @param {string} id - Role UUID
 * @param {Object} data - { permissionIds: [] }
 * @returns {Promise}
 */
export const assignPermissionsToRole = (id, data) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `roles/${id}/permissions`;
    apiObject.body = data;
    return ApiService.callApi(apiObject);
};

/**
 * Get role permissions
 * @param {string} id - Role UUID
 * @returns {Promise}
 */
export const getRolePermissions = (id) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `roles/${id}/permissions`;
    return ApiService.callApi(apiObject);
};

