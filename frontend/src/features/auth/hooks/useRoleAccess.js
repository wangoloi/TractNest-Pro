import { useAuth } from '../../../app/providers/AuthContext';
import { 
  hasPermission, 
  canAccess, 
  getRoleLabel, 
  getNavigationItems,
  isOwner,
  isAdmin,
  isUser,
  ROLES
} from '../../../lib/constants/roles';

/**
 * Custom hook for role-based access control
 * Provides easy access to role permissions and navigation
 */
export const useRoleAccess = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'user';

  return {
    // User role information
    userRole,
    roleLabel: getRoleLabel(userRole),
    isOwner: isOwner(userRole),
    isAdmin: isAdmin(userRole),
    isUser: isUser(userRole),
    
    // Permission checks
    hasPermission: (feature, action = 'view') => hasPermission(userRole, feature, action),
    canAccess: (feature) => canAccess(userRole, feature),
    
    // Navigation
    navigationItems: getNavigationItems(userRole),
    
    // Role constants
    ROLES,
    
    // Helper functions
    canViewDashboard: () => canAccess(userRole, 'dashboard'),
    canManageSales: () => hasPermission(userRole, 'sales', 'manage'),
    canManageInventory: () => hasPermission(userRole, 'inventory', 'manage'),
    canManageCustomers: () => hasPermission(userRole, 'customers', 'manage'),
    canManageSubscriptions: () => hasPermission(userRole, 'subscriptions', 'manage'),
    canViewAnalytics: () => canAccess(userRole, 'analytics'),
    canManageSettings: () => hasPermission(userRole, 'settings', 'edit'),
    
    // Owner-specific permissions
    canManageAdmins: () => hasPermission(userRole, 'adminManagement', 'manage'),
    canViewEnterpriseAnalytics: () => hasPermission(userRole, 'analytics', 'enterprise'),
    
    // Admin-specific permissions
    canManageUsers: () => hasPermission(userRole, 'userManagement', 'manage'),
    canViewBusinessAnalytics: () => hasPermission(userRole, 'analytics', 'business'),
    
    // User-specific permissions
    canViewOwnData: () => isUser(userRole),
    canEditProfile: () => hasPermission(userRole, 'settings', 'profile')
  };
};

export default useRoleAccess;
