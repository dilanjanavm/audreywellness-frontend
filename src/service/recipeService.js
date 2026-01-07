// src/service/recipeService.js

import ApiService from "./apiService";

/**
 * Get all recipes with pagination and filters
 * @param {Object} filters - Filter options
 * @param {string} filters.productId - Filter by product ID (UUID)
 * @param {string} filters.itemId - Filter by item ID (UUID)
 * @param {string} filters.batchSize - Filter by batch size (e.g., "batch10kg")
 * @param {string} filters.status - Filter by status: "active", "draft", "archived"
 * @param {string} filters.search - Search in recipe name and batch size
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 10)
 * @param {boolean} filters.includeVersions - Include all versions (default: false, only active versions)
 * @returns {Promise}
 */
export const getAllRecipes = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.productId) queryParams.append('productId', filters.productId);
    if (filters.itemId) queryParams.append('itemId', filters.itemId);
    if (filters.batchSize) queryParams.append('batchSize', filters.batchSize);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.includeVersions !== undefined) queryParams.append('includeVersions', filters.includeVersions.toString());
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `recipes${queryString ? `?${queryString}` : ''}`;
    
    return ApiService.callApi(apiObject);
};

/**
 * Get recipe by ID
 * @param {string} recipeId - Recipe UUID
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeVersions - Include version history (default: false)
 * @returns {Promise}
 */
export const getRecipeById = (recipeId, options = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (options.includeVersions !== undefined) {
        queryParams.append('includeVersions', options.includeVersions.toString());
    }
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `recipes/${recipeId}${queryString ? `?${queryString}` : ''}`;
    
    return ApiService.callApi(apiObject);
};

/**
 * Create a new recipe
 * @param {Object} recipeData - Recipe data
 * @returns {Promise}
 */
export const createRecipe = (recipeData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = 'recipes';
    apiObject.body = recipeData;
    return ApiService.callApi(apiObject);
};

/**
 * Update recipe
 * @param {string} recipeId - Recipe UUID
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise}
 */
export const updateRecipe = (recipeId, recipeData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `recipes/${recipeId}`;
    apiObject.body = recipeData;
    return ApiService.callApi(apiObject);
};

/**
 * Delete recipe
 * @param {string} recipeId - Recipe UUID
 * @returns {Promise}
 */
export const deleteRecipe = (recipeId) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `recipes/${recipeId}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get version history for a recipe by product ID and batch size
 * @param {string} productId - Product UUID
 * @param {string} batchSize - Batch size (e.g., "batch10kg")
 * @returns {Promise}
 */
export const getVersionHistory = (productId, batchSize) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `recipes/product/${productId}/batch/${batchSize}/versions`;
    return ApiService.callApi(apiObject);
};

/**
 * Set a recipe version as active
 * @param {string} recipeId - Recipe UUID
 * @returns {Promise}
 * 
 * Endpoint: PUT /recipes/:id/set-active
 * Authentication: Required (JWT)
 * Roles: ADMIN or MANAGER only
 * Request Body: Empty object {} or omit entirely
 */
export const setActiveVersion = (recipeId) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `recipes/${recipeId}/set-active`;
    // No body required - empty object or omit entirely per API spec
    apiObject.body = {};
    return ApiService.callApi(apiObject);
};

/**
 * Get recipes by product ID (using getAllRecipes with productId filter)
 * @param {string} productId - Product UUID
 * @param {Object} additionalFilters - Additional filter options
 * @returns {Promise}
 */
export const getRecipesByProductId = (productId, additionalFilters = {}) => {
    return getAllRecipes({
        productId,
        ...additionalFilters,
    });
};

/**
 * Get costed products for recipe creation
 * @param {Object} filters - Filter options
 * @returns {Promise}
 */
export const getCostedProductsForRecipe = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/products/costed${queryString ? `?${queryString}` : ''}`;
    
    return ApiService.callApi(apiObject);
};

/**
 * Get product costing details by itemId for recipe
 * @param {string} itemId - Item UUID
 * @returns {Promise}
 */
export const getProductCostingForRecipe = (itemId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/products/costed?itemId=${itemId}`;
    return ApiService.callApi(apiObject);
};

