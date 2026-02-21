// RBAC Permissions and Hooks
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'DRIVER' | 'ANALYST';

export type Permission = 
  | 'view_dashboard'
  | 'view_vehicles'
  | 'manage_vehicles'
  | 'view_drivers'
  | 'manage_drivers'
  | 'view_trips'
  | 'manage_trips'
  | 'dispatch_trips'
  | 'view_maintenance'
  | 'manage_maintenance'
  | 'view_expenses'
  | 'manage_expenses'
  | 'view_analytics'
  | 'export_reports'
  | 'manage_users'
  | 'view_settings';

// RBAC Permission Matrix
const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'view_dashboard',
    'view_vehicles',
    'manage_vehicles',
    'view_drivers',
    'manage_drivers',
    'view_trips',
    'manage_trips',
    'dispatch_trips',
    'view_maintenance',
    'manage_maintenance',
    'view_expenses',
    'manage_expenses',
    'view_analytics',
    'export_reports',
    'manage_users',
    'view_settings'
  ],
  MANAGER: [
    'view_dashboard',
    'view_vehicles',
    'manage_vehicles',
    'view_drivers',
    'manage_drivers',
    'view_trips',
    'manage_trips',
    'dispatch_trips',
    'view_maintenance',
    'manage_maintenance',
    'view_expenses',
    'manage_expenses',
    'view_analytics',
    'export_reports',
    'view_settings'
  ],
  DISPATCHER: [
    'view_dashboard',
    'view_vehicles',
    'view_drivers',
    'view_trips',
    'manage_trips',
    'dispatch_trips',
    'view_maintenance',
    'view_expenses'
  ],
  DRIVER: [
    'view_dashboard',
    'view_trips',
    'view_expenses'
  ],
  ANALYST: [
    'view_dashboard',
    'view_vehicles',
    'view_drivers',
    'view_trips',
    'view_maintenance',
    'view_expenses',
    'view_analytics',
    'export_reports'
  ],
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) || false;
};

// Check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

// React Hook for permission checking
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role as UserRole;

  return {
    hasPermission: (permission: Permission) => 
      userRole ? hasPermission(userRole, permission) : false,
    hasAnyPermission: (permissions: Permission[]) => 
      userRole ? hasAnyPermission(userRole, permissions) : false,
    hasAllPermissions: (permissions: Permission[]) => 
      userRole ? hasAllPermissions(userRole, permissions) : false,
    canView: (resource: string) => {
      const permission = `view_${resource}` as Permission;
      return userRole ? hasPermission(userRole, permission) : false;
    },
    canManage: (resource: string) => {
      const permission = `manage_${resource}` as Permission;
      return userRole ? hasPermission(userRole, permission) : false;
    },
    role: userRole,
  };
};

// Component wrapper for permission-based rendering
interface ProtectedProps {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires all permissions; otherwise any permission
}

export const Protected: React.FC<ProtectedProps> = ({
  permission,
  children,
  fallback = null,
  requireAll = false
}) => {
  const permissions = usePermissions();
  
  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? permissions.hasAllPermissions(permission)
      : permissions.hasAnyPermission(permission)
    : permissions.hasPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
