/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines permissions and access levels for different user roles
 */

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin', 
  USER: 'user'
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User'
};

// Feature permissions for each role
export const FEATURE_PERMISSIONS = {
  [ROLES.OWNER]: {
    // Owner-specific features (Bachawa - TrackNest Pro Owner)
    dashboard: {
      view: true,
      type: 'owner-dashboard' // Special owner dashboard
    },
    customers: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage: true // Full customer management
    },
    subscriptions: {
      view: true,
      manage: true,
      billing: true
    },
    communications: {
      view: true,
      send: true,
      manage: true
    },
    settings: {
      view: true,
      edit: true,
      system: true
    },
    analytics: {
      view: true,
      enterprise: true
    },
    // Owner can see all admin activities
    adminManagement: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      monitor: true
    },
    // Restricted features for owner
    sales: {
      view: false, // Owner doesn't manage sales directly
      create: false,
      edit: false
    },
    inventory: {
      view: false,
      manage: false
    },
    receipts: {
      view: false,
      create: false
    }
  },
  
  [ROLES.ADMIN]: {
    // Admin features (Business owners using TrackNest Pro)
    dashboard: {
      view: true,
      type: 'admin-dashboard'
    },
    sales: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage: true
    },
    inventory: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage: true,
      stock: true, // Enable stocking for admin
      stockItems: true // Enable stocking items
    },
    receipts: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    customers: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage: true
    },
    statements: {
      view: true,
      generate: true
    },
    settings: {
      view: true,
      edit: true,
      business: true
    },
    // Admin can manage their own users
    userManagement: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    // Restricted features for admin
    subscriptions: {
      view: false, // Admin doesn't manage subscriptions
      manage: false
    },
    adminManagement: {
      view: false,
      create: false,
      edit: false
    },
    analytics: {
      view: true,
      business: true,
      enterprise: false
    }
  },
  
  [ROLES.USER]: {
    // User features (End users of admin businesses)
    dashboard: {
      view: true,
      type: 'user-dashboard'
    },
    sales: {
      view: true, // Can view their own sales
      create: true, // Can make sales
      edit: false,
      delete: false,
      manage: true, // Can manage sales
      purchase: true // Can purchase items
    },
    inventory: {
      view: true, // Can view available inventory
      create: true, // Can add stock
      edit: false,
      delete: false,
      manage: true, // Can manage inventory
      notifications: true, // Can get low stock notifications
      stockLevels: true, // Can see remaining stock
      lowStockAlerts: true, // Get notifications for items < 5
      stock: true, // Enable stocking for users
      stockItems: true // Enable stocking items
    },
    receipts: {
      view: true, // Can view their own receipts
      create: false,
      edit: false,
      delete: false
    },
    statements: {
      view: true, // Can view their own statements
      generate: false,
      download: true // Can download their statements
    },
    communications: {
      view: true,
      send: true, // Can communicate with admin
      receive: true,
      chat: true // Can chat with admin
    },
    settings: {
      view: true,
      edit: true,
      profile: true
    },
    // Restricted features for users
    customers: {
      view: false,
      create: false,
      edit: false,
      delete: false
    },
    userManagement: {
      view: false,
      create: false,
      edit: false,
      delete: false
    },
    subscriptions: {
      view: false,
      manage: false
    },
    adminManagement: {
      view: false,
      create: false,
      edit: false
    },
    analytics: {
      view: false,
      business: false,
      enterprise: false
    }
  }
};

// Navigation menu items for each role
export const ROLE_NAVIGATION = {
  [ROLES.OWNER]: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'Home',
      path: '/',
      description: 'Owner Analytics & Overview'
    },
    {
      id: 'customers',
      name: 'My Customers (Admins)',
      icon: 'Users',
      path: '/customers',
      description: 'Manage Admin Customers'
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      icon: 'CreditCard',
      path: '/subscriptions',
      description: 'Manage Customer Subscriptions'
    },
    {
      id: 'communications',
      name: 'Communications',
      icon: 'MessageSquare',
      path: '/communications',
      description: 'Communicate with Admins'
    },
    {
      id: 'analytics',
      name: 'Enterprise Analytics',
      icon: 'BarChart3',
      path: '/analytics',
      description: 'Business Performance Analytics'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: 'Settings',
      path: '/settings',
      description: 'TrackNest Pro System Settings'
    }
  ],
  
  [ROLES.ADMIN]: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'Home',
      path: '/',
      description: 'Business Overview'
    },
    {
      id: 'sales',
      name: 'Sales Management',
      icon: 'ShoppingCart',
      path: '/sales',
      description: 'Manage Sales & Invoices'
    },
    {
      id: 'my-stock',
      name: 'My Stock',
      icon: 'Package',
      path: '/my-stock',
      description: 'View Stock Receipts & Inventory'
    },
    {
      id: 'stock-management',
      name: 'Stock Management',
      icon: 'Box',
      path: '/stock-management',
      description: 'Manage Stock Levels & Restocking'
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: 'Users',
      path: '/customers',
      description: 'Manage Business Customers'
    },
    {
      id: 'receipts',
      name: 'Receipts',
      icon: 'FileText',
      path: '/receipts',
      description: 'Manage Receipts & Transactions'
    },
    {
      id: 'statements',
      name: 'Statements',
      icon: 'BarChart3',
      path: '/statements',
      description: 'Financial Statements & Reports'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: 'UserPlus',
      path: '/users',
      description: 'Manage Business Users'
    },
    {
      id: 'settings',
      name: 'Business Settings',
      icon: 'Settings',
      path: '/settings',
      description: 'Business Configuration'
    }
  ],
  
  [ROLES.USER]: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'Home',
      path: '/',
      description: 'Personal Overview'
    },
    {
      id: 'sales',
      name: 'Sales & Inventory',
      icon: 'ShoppingCart',
      path: '/sales',
      description: 'Make Sales & Manage Inventory'
    },
    {
      id: 'inventory',
      name: 'Available Stock',
      icon: 'Package',
      path: '/inventory',
      description: 'Browse Available Products'
    },
    {
      id: 'my-stock',
      name: 'My Stock',
      icon: 'Package',
      path: '/my-stock',
      description: 'View Stock Receipts & Inventory'
    },
    {
      id: 'stock-management',
      name: 'Stock Management',
      icon: 'Box',
      path: '/stock-management',
      description: 'Manage Stock Levels & Restocking'
    },
    {
      id: 'purchases',
      name: 'My Purchases',
      icon: 'ShoppingCart',
      path: '/purchases',
      description: 'View Purchase History'
    },
    {
      id: 'receipts',
      name: 'My Receipts',
      icon: 'FileText',
      path: '/receipts',
      description: 'View My Receipts'
    },
    {
      id: 'statements',
      name: 'My Statements',
      icon: 'BarChart3',
      path: '/statements',
      description: 'View My Financial Statements'
    },
    {
      id: 'communications',
      name: 'Contact Admin',
      icon: 'MessageSquare',
      path: '/communications',
      description: 'Communicate with Business Admin'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: 'User',
      path: '/profile',
      description: 'Personal Profile Settings'
    }
  ]
};

// Helper functions
export const hasPermission = (userRole, feature, action = 'view') => {
  if (!userRole || !FEATURE_PERMISSIONS[userRole]) {
    return false;
  }
  
  const permissions = FEATURE_PERMISSIONS[userRole][feature];
  return permissions && permissions[action] === true;
};

export const canAccess = (userRole, feature) => {
  return hasPermission(userRole, feature, 'view');
};

export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || 'Unknown';
};

export const getNavigationItems = (role) => {
  return ROLE_NAVIGATION[role] || [];
};

export const isOwner = (userRole) => userRole === ROLES.OWNER;
export const isAdmin = (userRole) => userRole === ROLES.ADMIN;
export const isUser = (userRole) => userRole === ROLES.USER;
