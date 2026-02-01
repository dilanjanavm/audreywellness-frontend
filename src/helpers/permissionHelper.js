/**
 * Permission Helper Utility
 * Handles permission checking and admin/super admin logic
 */

// Admin role names that have all permissions (case insensitive check)
const ADMIN_ROLES = ['super admin', 'admin'];

/**
 * Get current user from sessionStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    const authUser = sessionStorage.getItem('authUser');
    if (!authUser) return null;
    return JSON.parse(authUser);
  } catch (error) {
    console.error('Error parsing authUser from sessionStorage:', error);
    return null;
  }
};

/**
 * Get user permissions from sessionStorage
 * @returns {Array} Array of permission objects
 */
export const getUserPermissions = () => {
  const user = getCurrentUser();
  if (!user) return [];
  return user.permissions || [];
};

/**
 * Get user role name
 * @returns {string|null} Role name or null
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  return user.roleName || user.role || null;
};

/**
 * Check if user is admin or super admin (has all permissions)
 * @returns {boolean} True if user is admin or super admin
 */
export const isSuperAdmin = () => {
  const role = getUserRole();
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return ADMIN_ROLES.some(adminRole => roleLower === adminRole.toLowerCase());
};

/**
 * Alias for isSuperAdmin for clarity
 * @returns {boolean} True if user is admin or super admin
 */
export const isAdmin = () => {
  return isSuperAdmin();
};

/**
 * Check if user has a specific permission
 * @param {string} permissionCode - Permission code to check (e.g., 'USER_CREATE')
 * @returns {boolean} True if user has permission or is admin/super admin
 */
export const hasPermission = (permissionCode) => {
  // Admin and Super Admin have all permissions
  if (isSuperAdmin()) {
    return true;
  }

  // Check if user has the specific permission
  const permissions = getUserPermissions();
  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some(permission => permission.code === permissionCode);
};

/**
 * Check if user has any of the specified permissions
 * @param {string|Array<string>} permissionCodes - Single permission code or array of codes
 * @returns {boolean} True if user has at least one permission or is admin/super admin
 */
export const hasAnyPermission = (permissionCodes) => {
  // Admin and Super Admin have all permissions
  if (isSuperAdmin()) {
    return true;
  }

  const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes];
  const permissions = getUserPermissions();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  const userPermissionCodes = permissions.map(p => p.code);
  return codes.some(code => userPermissionCodes.includes(code));
};

/**
 * Check if user has all of the specified permissions
 * @param {string|Array<string>} permissionCodes - Single permission code or array of codes
 * @returns {boolean} True if user has all permissions or is admin/super admin
 */
export const hasAllPermissions = (permissionCodes) => {
  // Admin and Super Admin have all permissions
  if (isSuperAdmin()) {
    return true;
  }

  const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes];
  const permissions = getUserPermissions();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  const userPermissionCodes = permissions.map(p => p.code);
  return codes.every(code => userPermissionCodes.includes(code));
};

/**
 * Check if user has permission for a specific module and action
 * @param {string} module - Module name (e.g., 'users', 'tasks')
 * @param {string} action - Action name (e.g., 'CREATE', 'UPDATE', 'DELETE', 'VIEW')
 * @returns {boolean} True if user has permission or is admin/super admin
 */
export const hasModulePermission = (module, action) => {
  const permissionCode = `${module.toUpperCase()}_${action.toUpperCase()}`;
  return hasPermission(permissionCode);
};

/**
 * Get all permissions for a specific module
 * @param {string} module - Module name (e.g., 'users', 'tasks')
 * @returns {Array} Array of permission objects for the module
 */
export const getModulePermissions = (module) => {
  const permissions = getUserPermissions();
  if (!permissions || permissions.length === 0) {
    return [];
  }
  return permissions.filter(p => p.module && p.module.toLowerCase() === module.toLowerCase());
};

/**
 * Check if user has any permission for a specific module
 * @param {string} module - Module name (e.g., 'users', 'tasks')
 * @returns {boolean} True if user has any permission for the module or is admin/super admin
 */
export const hasModuleAccess = (module) => {
  if (isSuperAdmin()) {
    return true;
  }
  const modulePermissions = getModulePermissions(module);
  return modulePermissions.length > 0;
};

/**
 * Get permission codes as an array
 * @returns {Array<string>} Array of permission codes
 */
export const getPermissionCodes = () => {
  if (isSuperAdmin()) {
    // Return all possible permission codes for super admin
    // This is a comprehensive list based on ALL_PERMISSIONS_LIST.md
    return [
      'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_VIEW',
      'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_VIEW', 'ROLE_ASSIGN_PERMISSIONS',
      'PERMISSION_CREATE', 'PERMISSION_UPDATE', 'PERMISSION_DELETE', 'PERMISSION_VIEW',
      'TASK_CREATE', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_VIEW',
      'COSTING_CREATE', 'COSTING_UPDATE', 'COSTING_DELETE', 'COSTING_VIEW',
      'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE', 'CUSTOMER_VIEW',
      'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE', 'SUPPLIER_VIEW',
      'ITEM_CREATE', 'ITEM_UPDATE', 'ITEM_DELETE', 'ITEM_VIEW',
      'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE', 'CATEGORY_VIEW',
      'COMPLAINT_CREATE', 'COMPLAINT_UPDATE', 'COMPLAINT_DELETE', 'COMPLAINT_VIEW',
      'RECIPE_CREATE', 'RECIPE_UPDATE', 'RECIPE_DELETE', 'RECIPE_VIEW',
    ];
  }

  const permissions = getUserPermissions();
  return permissions.map(p => p.code);
};

