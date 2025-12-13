import ApiService from "./apiService";

/**
 * Get all phases
 * @param {boolean} includeTasks - If true, includes tasks with each phase
 */
export async function getAllPhase(includeTasks = false) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    // Backend expects includeTasks as query param: ?includeTasks=true or ?includeTasks=1
    const queryParam = includeTasks ? '?includeTasks=true' : '';
    apiObject.endpoint = `tasks/phases${queryParam}`;
    return await ApiService.callApi(apiObject);
}

/**
 * Create a new phase
 */
export async function createPhase(phaseBody) {
    const apiObject = {};
    apiObject.method = "POST";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/phases`;
    apiObject.body = phaseBody;
    return await ApiService.callApi(apiObject);
}

/**
 * Update a phase
 */
export async function updatePhaseById(phaseId, phaseBody) {
    const apiObject = {};
    apiObject.method = "PUT";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/phases/${phaseId}`;
    apiObject.body = phaseBody;
    return await ApiService.callApi(apiObject);
}

/**
 * Delete a phase
 */
export async function deletePhase(phaseId, reassignPhaseId = null) {
    const apiObject = {};
    apiObject.method = "DELETE";
    apiObject.authentication = true;
    const queryParam = reassignPhaseId ? `?reassignPhaseId=${reassignPhaseId}` : '';
    apiObject.endpoint = `tasks/phases/${phaseId}${queryParam}`;
    return await ApiService.callApi(apiObject);
}

/**
 * Get tasks for a specific phase with filters
 */
export async function getPhaseTasks(phaseId, filters = {}) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (filters.status) {
        const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
        statusArray.forEach(status => queryParams.append('status', status));
    }
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    apiObject.endpoint = `tasks/phases/${phaseId}/tasks${queryString ? `?${queryString}` : ''}`;
    return await ApiService.callApi(apiObject);
}
