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
    apiObject.endpoint = `costing/item/${itemId}/history`;
    apiObject.params = {page, limit};
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
    apiObject.endpoint = `costing/${costingId}/export`;
    apiObject.params = {format};
    return ApiService.callApi(apiObject);
};

/**
 * Get costing statistics
 */
export const getCostingStats = (filters = {}) => {
    const apiObject = {};
    apiObject.method = 'GET';
    apiObject.authentication = true;
    apiObject.endpoint = `costing/stats`;
    apiObject.params = filters;
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
    getCurrentRawMaterialPrices
};