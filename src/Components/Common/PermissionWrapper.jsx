import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, hasModulePermission, hasModuleAccess, isSuperAdmin } from '../../helpers/permissionHelper';

/**
 * PermissionWrapper Component
 * Conditionally renders children based on permission checks
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if permission check passes
 * @param {string} props.permission - Single permission code to check (e.g., 'USER_CREATE')
 * @param {string|Array<string>} props.anyPermission - Check if user has ANY of these permissions
 * @param {string|Array<string>} props.allPermissions - Check if user has ALL of these permissions
 * @param {string} props.module - Module name for module-based permission check
 * @param {string} props.action - Action name for module-based permission check (used with module)
 * @param {boolean} props.moduleAccess - Check if user has access to the module (any permission in module)
 * @param {React.ReactNode} props.fallback - Content to render if permission check fails (optional)
 * @param {boolean} props.showFallback - Whether to show fallback or render nothing (default: false)
 */
const PermissionWrapper = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  module,
  action,
  moduleAccess,
  fallback = null,
  showFallback = false,
}) => {
  let hasAccess = false;

  // Admin and Super Admin have all permissions
  if (isSuperAdmin()) {
    hasAccess = true;
  }
  // Check single permission
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check any permission
  else if (anyPermission) {
    hasAccess = hasAnyPermission(anyPermission);
  }
  // Check all permissions
  else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  }
  // Check module permission (module + action)
  else if (module && action) {
    hasAccess = hasModulePermission(module, action);
  }
  // Check module access (any permission in module)
  else if (moduleAccess && module) {
    hasAccess = hasModuleAccess(module);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback}</>;
  }

  return null;
};

export default PermissionWrapper;

