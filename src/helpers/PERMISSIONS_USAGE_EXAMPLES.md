# Permission System Usage Examples

This document provides examples of how to use the permission system throughout the application.

## Table of Contents
1. [Using Permission Helper Functions](#using-permission-helper-functions)
2. [Using the usePermissions Hook](#using-the-usepermissions-hook)
3. [Using PermissionWrapper Component](#using-permissionwrapper-component)
4. [Common Use Cases](#common-use-cases)

## Using Permission Helper Functions

Direct import and use in any component:

```javascript
import { hasPermission, hasModulePermission, isSuperAdmin } from '../../helpers/permissionHelper';

function MyComponent() {
  // Check single permission
  const canCreateUser = hasPermission('USER_CREATE');
  
  // Check module permission
  const canViewTasks = hasModulePermission('tasks', 'VIEW');
  
  // Check if super admin
  const isAdmin = isSuperAdmin();

  return (
    <div>
      {canCreateUser && <button>Create User</button>}
      {canViewTasks && <div>Task List</div>}
      {isAdmin && <div>Admin Panel</div>}
    </div>
  );
}
```

## Using the usePermissions Hook

Use the hook in React components for reactive permission checks:

```javascript
import usePermissions from '../../Components/Hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasModuleAccess, isSuperAdmin, permissions } = usePermissions();

  return (
    <div>
      {hasPermission('USER_CREATE') && <button>Create User</button>}
      {hasModuleAccess('tasks') && <TaskModule />}
      {isSuperAdmin && <AdminSection />}
      
      <div>
        User has {permissions.length} permissions
      </div>
    </div>
  );
}
```

## Using PermissionWrapper Component

Wrap components or JSX elements to conditionally render based on permissions:

```javascript
import PermissionWrapper from '../../Components/Common/PermissionWrapper';

function UserManagementPage() {
  return (
    <div>
      {/* Check single permission */}
      <PermissionWrapper permission="USER_CREATE">
        <button>Create New User</button>
      </PermissionWrapper>

      {/* Check any of multiple permissions */}
      <PermissionWrapper anyPermission={['USER_CREATE', 'USER_UPDATE']}>
        <UserForm />
      </PermissionWrapper>

      {/* Check all permissions */}
      <PermissionWrapper allPermissions={['USER_CREATE', 'USER_UPDATE', 'USER_DELETE']}>
        <AdvancedUserControls />
      </PermissionWrapper>

      {/* Check module permission */}
      <PermissionWrapper module="users" action="VIEW">
        <UserList />
      </PermissionWrapper>

      {/* Check module access (any permission in module) */}
      <PermissionWrapper moduleAccess module="tasks">
        <TaskDashboard />
      </PermissionWrapper>

      {/* With fallback content */}
      <PermissionWrapper 
        permission="USER_DELETE"
        showFallback
        fallback={<p>You don't have permission to delete users</p>}
      >
        <button>Delete User</button>
      </PermissionWrapper>
    </div>
  );
}
```

## Common Use Cases

### 1. Protecting Buttons/Actions

```javascript
import { hasPermission } from '../../helpers/permissionHelper';

function UserTable({ users }) {
  return (
    <table>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>
            {hasPermission('USER_UPDATE') && (
              <button onClick={() => editUser(user.id)}>Edit</button>
            )}
            {hasPermission('USER_DELETE') && (
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            )}
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### 2. Protecting Entire Routes/Pages

```javascript
import { hasModuleAccess } from '../../helpers/permissionHelper';
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  if (!hasModuleAccess('users')) {
    return <Navigate to="/unauthorized" />;
  }

  return <UserManagement />;
}
```

### 3. Conditional Menu Items

```javascript
import usePermissions from '../../Components/Hooks/usePermissions';

function SidebarMenu() {
  const { hasModuleAccess, isSuperAdmin } = usePermissions();

  return (
    <nav>
      {hasModuleAccess('users') && <MenuItem to="/users">Users</MenuItem>}
      {hasModuleAccess('tasks') && <MenuItem to="/tasks">Tasks</MenuItem>}
      {hasModuleAccess('costing') && <MenuItem to="/costing">Costing</MenuItem>}
      {isSuperAdmin && <MenuItem to="/admin">Admin Panel</MenuItem>}
    </nav>
  );
}
```

### 4. Conditional Form Fields

```javascript
import PermissionWrapper from '../../Components/Common/PermissionWrapper';

function UserForm() {
  return (
    <form>
      <input name="name" />
      <input name="email" />
      
      <PermissionWrapper permission="USER_UPDATE">
        <select name="role">
          <option>Admin</option>
          <option>User</option>
        </select>
      </PermissionWrapper>
    </form>
  );
}
```

### 5. API Call Protection

```javascript
import { hasPermission } from '../../helpers/permissionHelper';

async function handleCreateUser(userData) {
  if (!hasPermission('USER_CREATE')) {
    message.error('You do not have permission to create users');
    return;
  }
  
  try {
    await createUser(userData);
    message.success('User created successfully');
  } catch (error) {
    message.error('Failed to create user');
  }
}
```

## Permission Codes Reference

Based on ALL_PERMISSIONS_LIST.md:

### Users Module
- `USER_CREATE` - Create User
- `USER_UPDATE` - Update User
- `USER_DELETE` - Delete User
- `USER_VIEW` - View User

### Tasks Module
- `TASK_CREATE` - Create Task
- `TASK_UPDATE` - Update Task
- `TASK_DELETE` - Delete Task
- `TASK_VIEW` - View Task

### Costing Module
- `COSTING_CREATE` - Create Costing
- `COSTING_UPDATE` - Update Costing
- `COSTING_DELETE` - Delete Costing
- `COSTING_VIEW` - View Costing

### And more... (see ALL_PERMISSIONS_LIST.md for complete list)

## Super Admin

Users with the role "Super Admin" (case insensitive) automatically have all permissions. The system automatically grants access to all features for super admins.

