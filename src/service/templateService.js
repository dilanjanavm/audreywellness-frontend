import ApiService from "./apiService";

// ========== PROJECT TEMPLATE MANAGEMENT ==========

/**
 * Get all project templates
 * @returns {Promise} Array of project templates
 */
export async function getAllTemplates() {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates`;
    return await ApiService.callApi(apiObject);
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID (UUID)
 * @returns {Promise} Template object with phases and configuration
 */
export async function getTemplateById(templateId) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/${templateId}`;
    return await ApiService.callApi(apiObject);
}

/**
 * Create a new project template
 * @param {Object} templateData - Template data:
 *   - name (string, required) - Template name
 *   - description (string, optional) - Template description
 *   - phases (array, required) - Array of phase configurations
 *   - isDefault (boolean, optional) - Whether this is a default template
 * @returns {Promise} Created template object
 */
export async function createTemplate(templateData) {
    const apiObject = {};
    apiObject.method = "POST";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates`;
    apiObject.body = templateData;
    return await ApiService.callApi(apiObject);
}

/**
 * Update an existing template
 * @param {string} templateId - Template ID (UUID)
 * @param {Object} templateData - Updated template data
 * @returns {Promise} Updated template object
 */
export async function updateTemplate(templateId, templateData) {
    const apiObject = {};
    apiObject.method = "PUT";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/${templateId}`;
    apiObject.body = templateData;
    return await ApiService.callApi(apiObject);
}

/**
 * Delete a template
 * @param {string} templateId - Template ID (UUID)
 * @returns {Promise} Deletion result
 */
export async function deleteTemplate(templateId) {
    const apiObject = {};
    apiObject.method = "DELETE";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/${templateId}`;
    return await ApiService.callApi(apiObject);
}

/**
 * Apply a template to create phases
 * @param {string} templateId - Template ID (UUID)
 * @param {Object} options - Optional configuration:
 *   - replaceExisting (boolean, optional) - Whether to replace existing phases
 *   - keepTasks (boolean, optional) - Whether to keep existing tasks
 * @returns {Promise} Created phases from template
 */
export async function applyTemplate(templateId, options = {}) {
    const apiObject = {};
    apiObject.method = "POST";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/${templateId}/apply`;
    apiObject.body = options;
    return await ApiService.callApi(apiObject);
}

/**
 * Create template from current phases
 * @param {Object} templateData - Template data with current phase configuration
 * @returns {Promise} Created template object
 */
export async function createTemplateFromPhases(templateData) {
    const apiObject = {};
    apiObject.method = "POST";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/from-phases`;
    apiObject.body = templateData;
    return await ApiService.callApi(apiObject);
}

/**
 * Get template by phase ID
 * @param {string} phaseId - Phase ID (UUID)
 * @returns {Promise} Template object assigned to the phase, or default template
 */
export async function getTemplateByPhaseId(phaseId) {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/by-phase/${phaseId}`;
    return await ApiService.callApi(apiObject);
}

/**
 * Get default template
 * @returns {Promise} Default template object
 */
export async function getDefaultTemplate() {
    const apiObject = {};
    apiObject.method = "GET";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/templates/default`;
    return await ApiService.callApi(apiObject);
}
