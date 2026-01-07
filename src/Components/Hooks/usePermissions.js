import { useMemo } from 'react';
import * as permissionHelper from '../../helpers/permissionHelper';

/**
 * Custom hook for permission checking
 * @returns {Object} Permission helper functions and user data
 */
export const usePermissions = () => {
  const user = useMemo(() => permissionHelper.getCurrentUser(), []);
  const permissions = useMemo(() => permissionHelper.getUserPermissions(), []);
  const role = useMemo(() => permissionHelper.getUserRole(), []);
  const superAdmin = useMemo(() => permissionHelper.isSuperAdmin(), []);

  return {
    // User data
    user,
    permissions,
    role,
    isSuperAdmin: superAdmin,
    
    // Permission checking functions
    hasPermission: (code) => permissionHelper.hasPermission(code),
    hasAnyPermission: (codes) => permissionHelper.hasAnyPermission(codes),
    hasAllPermissions: (codes) => permissionHelper.hasAllPermissions(codes),
    hasModulePermission: (module, action) => permissionHelper.hasModulePermission(module, action),
    hasModuleAccess: (module) => permissionHelper.hasModuleAccess(module),
    getModulePermissions: (module) => permissionHelper.getModulePermissions(module),
    getPermissionCodes: () => permissionHelper.getPermissionCodes(),
  };
};

export default usePermissions;

