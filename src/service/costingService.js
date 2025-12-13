// src/service/costingService.js


// ========== COSTING MANAGEMENT ==========

import ApiService from "./apiService";

/**
 * Create a new costing
 */
export const createCosting = (costingData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `costing`;
    apiObject.body = costingData;
    return ApiService.callApi(apiObject);
};

/**
 * Get all costings for an item
 */
export const getCostingsByItem = (itemId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/item/${itemId}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get active costing for an item
 */
export const getActiveCostingByItem = (itemId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/item/${itemId}/active`;
    return ApiService.callApi(apiObject);
};

/**
 * Get costing by ID
 */
export const getCostingById = (costingId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}`;
    return ApiService.callApi(apiObject);
};

/**
 * Update costing
 */
export const updateCosting = (costingId, costingData) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}`;
    apiObject.body = costingData;
    return ApiService.callApi(apiObject);
};

/**
 * Set costing as active version
 */
export const setCostingActive = (costingId) => {
    const apiObject = {};
    apiObject.method = 'PUT';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}/set-active`;
    return ApiService.callApi(apiObject);
};

/**
 * Delete costing
 */
export const deleteCosting = (costingId) => {
    const apiObject = {};
    apiObject.method = 'DELETE';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}`;
    return ApiService.callApi(apiObject);
};

// ========== COMPARISON & ANALYSIS ==========

/**
 * Compare two costing versions
 */
export const compareCostings = (costingId1, costingId2) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/compare/${costingId1}/${costingId2}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get costing history with pagination
 */
export const getCostingHistory = (itemId, page = 1, limit = 10) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    apiObject.endpoint = `costing/item/${itemId}/history?${queryParams.toString()}`;
    return ApiService.callApi(apiObject);
};

// ========== CALCULATIONS & RECALCULATIONS ==========

/**
 * Recalculate costing with current prices
 */
export const recalculateCosting = (costingId) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}/recalculate`;
    return ApiService.callApi(apiObject);
};

// ========== BULK OPERATIONS ==========

/**
 * Bulk deactivate costings
 */
export const bulkDeactivateCostings = (costingIds) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/bulk/deactivate`;
    apiObject.body = {costingIds};
    return ApiService.callApi(apiObject);
};

// ========== UTILITY & HEALTH CHECKS ==========

/**
 * Health check for costing service
 */
export const checkCostingHealth = () => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/health/check`;
    return ApiService.callApi(apiObject);
};

// ========== COSTING TEMPLATES & DEFAULTS ==========

/**
 * Get default costing template for an item type
 */
export const getCostingTemplate = (itemType) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/templates/${itemType}`;
    return ApiService.callApi(apiObject);
};

/**
 * Validate costing calculations before submission
 */
export const validateCosting = (costingData) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/validate`;
    apiObject.body = costingData;
    return ApiService.callApi(apiObject);
};

// ========== EXPORT & REPORTING ==========

/**
 * Export costing as PDF/Excel
 */
export const exportCosting = (costingId, format = 'pdf') => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/${costingId}/export?format=${format}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get costing statistics
 */
export const getCostingStats = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
            queryParams.append(key, filters[key]);
        }
    });
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/stats${queryString ? `?${queryString}` : ''}`;
    return ApiService.callApi(apiObject);
};

// ========== RAW MATERIAL MANAGEMENT ==========

/**
 * Get raw materials by category for costing
 */
export const getRawMaterialsByCategory = (categoryIds) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/categories/items`;
    apiObject.body = {categoryIds};
    return ApiService.callApi(apiObject);
};

/**
 * Get current prices for raw materials
 */
export const getCurrentRawMaterialPrices = (itemIds) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `items/batch-prices`;
    apiObject.body = {itemIds};
    return ApiService.callApi(apiObject);
};

// ========== ITEMS WITH COSTING ==========

/**
 * Get all items with costing information (paginated)
 */
export const getItemsWithCosting = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.includeSuppliers !== undefined) queryParams.append('includeSuppliers', filters.includeSuppliers);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.onlyWithCosting !== undefined) queryParams.append('onlyWithCosting', filters.onlyWithCosting);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/items/co${queryString ? `?${queryString}` : ''}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get items by category with costing information (paginated)
 */
export const getItemsByCategoryWithCosting = (category, filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.includeSuppliers !== undefined) queryParams.append('includeSuppliers', filters.includeSuppliers);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.onlyWithCosting !== undefined) queryParams.append('onlyWithCosting', filters.onlyWithCosting);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/items/category/${category}${queryString ? `?${queryString}` : ''}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get single item with costing information by item code
 */
export const getItemByCodeWithCosting = (itemCode) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/items/${itemCode}`;
    return ApiService.callApi(apiObject);
};

/**
 * Search items with costing information (paginated)
 */
export const searchItemsWithCosting = (term, filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.includeSuppliers !== undefined) queryParams.append('includeSuppliers', filters.includeSuppliers);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.onlyWithCosting !== undefined) queryParams.append('onlyWithCosting', filters.onlyWithCosting);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/items/search/${term}${queryString ? `?${queryString}` : ''}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get items by multiple category IDs with costing information (paginated)
 */
export const getItemsByCategoriesWithCosting = (categoryIds, filters = {}) => {
    const apiObject = {};
    apiObject.method = 'POST';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/items/by-categories`;
    apiObject.body = {
        categoryIds,
        ...filters
    };
    return ApiService.callApi(apiObject);
};

// ========== COSTED PRODUCTS ==========

/**
 * Get all products that have costing records (costed products) with pagination and filtering
 */
export const getCostedProducts = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `costing/products/costed${queryString ? `?${queryString}` : ''}`;
    return ApiService.callApi(apiObject);
};

/**
 * Get detailed cost history for a product with cost change tracking between versions
 */
export const getProductCostHistory = (itemId) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/products/${itemId}/cost-history`;
    return ApiService.callApi(apiObject);
};

export default {
    // Costing Management
    createCosting,
    getCostingsByItem,
    getActiveCostingByItem,
    getCostingById,
    updateCosting,
    setCostingActive,
    deleteCosting,

    // Comparison & Analysis
    compareCostings,
    getCostingHistory,

    // Calculations
    recalculateCosting,

    // Bulk Operations
    bulkDeactivateCostings,

    // Utility
    checkCostingHealth,
    getCostingTemplate,
    validateCosting,

    // Export & Reporting
    exportCosting,
    getCostingStats,

    // Raw Material Management
    getRawMaterialsByCategory,
    getCurrentRawMaterialPrices,

    // Items with Costing
    getItemsWithCosting,
    getItemsByCategoryWithCosting,
    getItemByCodeWithCosting,
    searchItemsWithCosting,
    getItemsByCategoriesWithCosting,

    // Costed Products
    getCostedProducts,
    getProductCostHistory
};