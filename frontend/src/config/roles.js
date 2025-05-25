// Role-Based Access Control Configuration
export const ROLES = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer'
};

export const PERMISSIONS = {
  // Dashboard
  'dashboard:view': 'View dashboard',
  'dashboard:export': 'Export dashboard data',
  'VIEW_ALL_BASES_DASHBOARD': 'dashboard:view:all',

  // User/Personnel
  'user:view': 'View users/personnel',
  'user:view:all': 'View all users across bases',
  'user:create': 'Create new users',
  'user:update': 'Update user information',
  'user:update:any': 'Update any user information',
  'user:delete': 'Delete users',
  'CREATE_USER': 'user:create',
  'UPDATE_USER': 'user:update',

  // Purchase
  'purchase:view': 'View purchases',
  'purchase:view:all': 'View all purchases across bases',
  'purchase:create': 'Create purchase orders',
  'purchase:update:own': 'Update own purchase orders',
  'purchase:update:any': 'Update any purchase order',
  'purchase:delete:own': 'Delete own purchase orders',
  'purchase:delete:any': 'Delete any purchase order',
  'purchase:approve': 'Approve purchase orders',
  'purchase:manage:inventory': 'Manage inventory levels',
  'CREATE_PURCHASE': 'purchase:create',
  'UPDATE_OWN_PURCHASE': 'purchase:update:own',
  'UPDATE_ANY_PURCHASE': 'purchase:update:any',
  'DELETE_OWN_PURCHASE': 'purchase:delete:own',
  'DELETE_ANY_PURCHASE': 'purchase:delete:any',
  'APPROVE_PURCHASE': 'purchase:approve',

  // Transfer
  'transfer:view': 'View transfers',
  'transfer:view:all': 'View all transfers across bases',
  'transfer:create': 'Create transfers',
  'transfer:update:own': 'Update own transfers',
  'transfer:update:any': 'Update any transfer',
  'transfer:delete:own': 'Delete own transfers',
  'transfer:delete:any': 'Delete any transfer',
  'transfer:approve': 'Approve transfers',
  'CREATE_TRANSFER': 'transfer:create',
  'UPDATE_OWN_TRANSFER': 'transfer:update:own',
  'UPDATE_ANY_TRANSFER': 'transfer:update:any',
  'DELETE_OWN_TRANSFER': 'transfer:delete:own',
  'DELETE_ANY_TRANSFER': 'transfer:delete:any',
  'APPROVE_TRANSFER': 'transfer:approve',

  // Assignment
  'assignment:view': 'View assignments',
  'assignment:view:all': 'View all assignments across bases',
  'assignment:create': 'Create assignments',
  'assignment:update:own': 'Update own assignments',
  'assignment:update:any': 'Update any assignment',
  'assignment:delete:own': 'Delete own assignments',
  'assignment:delete:any': 'Delete any assignment',
  'CREATE_ASSIGNMENT': 'assignment:create',
  'UPDATE_OWN_ASSIGNMENT': 'assignment:update:own',
  'UPDATE_ANY_ASSIGNMENT': 'assignment:update:any',
  'DELETE_OWN_ASSIGNMENT': 'assignment:delete:own',
  'DELETE_ANY_ASSIGNMENT': 'assignment:delete:any',
  'APPROVE_ASSIGNMENT': 'assignment:approve',

  // Expenditure
  'expenditure:view': 'View expenditures',
  'expenditure:view:all': 'View all expenditures across bases',
  'expenditure:create': 'Create expenditures',
  'expenditure:update:own': 'Update own expenditures',
  'expenditure:update:any': 'Update any expenditure',
  'expenditure:delete:own': 'Delete own expenditures',
  'expenditure:delete:any': 'Delete any expenditure',
  'CREATE_EXPENDITURE': 'expenditure:create',
  'UPDATE_OWN_EXPENDITURE': 'expenditure:update:own',
  'UPDATE_ANY_EXPENDITURE': 'expenditure:update:any',
  'DELETE_OWN_EXPENDITURE': 'expenditure:delete:own',
  'DELETE_ANY_EXPENDITURE': 'expenditure:delete:any',

  // System
  'system:admin': 'System administration',
  'system:reports': 'Generate system reports',
  'system:audit': 'Access audit logs',
  'ACCESS_ADMIN_PANEL': 'system:admin',
  'EXPORT_DATA': 'dashboard:export'
};

// Role-Permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard:view', 'dashboard:export',
    'user:view', 'user:view:all', 'user:create', 'user:update', 'user:update:any', 'user:delete',
    'purchase:view', 'purchase:view:all', 'purchase:create', 'purchase:update:own', 'purchase:update:any',
    'purchase:delete:own', 'purchase:delete:any', 'purchase:approve', 'purchase:manage:inventory',
    'transfer:view', 'transfer:view:all', 'transfer:create', 'transfer:update:own', 'transfer:update:any',
    'transfer:delete:own', 'transfer:delete:any', 'transfer:approve',
    'assignment:view', 'assignment:view:all', 'assignment:create', 'assignment:update:own', 'assignment:update:any',
    'assignment:delete:own', 'assignment:delete:any',
    'expenditure:view', 'expenditure:view:all', 'expenditure:create', 'expenditure:update:own', 'expenditure:update:any',
    'expenditure:delete:own', 'expenditure:delete:any',
    'system:admin', 'system:reports', 'system:audit'
  ],

  [ROLES.BASE_COMMANDER]: [
    'dashboard:view', 'dashboard:export',
    'user:view', 'user:create', 'user:update',
    'purchase:view', 'purchase:create', 'purchase:update:own', 'purchase:update:any',
    'purchase:delete:own', 'purchase:delete:any', 'purchase:approve', 'purchase:manage:inventory',
    'transfer:view', 'transfer:create', 'transfer:update:own', 'transfer:update:any',
    'transfer:delete:own', 'transfer:delete:any', 'transfer:approve',
    'assignment:view', 'assignment:create', 'assignment:update:own', 'assignment:update:any',
    'assignment:delete:own', 'assignment:delete:any',
    'expenditure:view', 'expenditure:create', 'expenditure:update:own', 'expenditure:update:any',
    'expenditure:delete:own', 'expenditure:delete:any',
    'system:reports'
  ],

  [ROLES.LOGISTICS_OFFICER]: [
    'dashboard:view',
    'user:view',
    'purchase:view', 'purchase:create', 'purchase:update:own', 'purchase:delete:own', 'purchase:manage:inventory',
    'transfer:view', 'transfer:create', 'transfer:update:own', 'transfer:delete:own',
    'assignment:view', 'assignment:create', 'assignment:update:own', 'assignment:delete:own',
    'expenditure:view', 'expenditure:create', 'expenditure:update:own', 'expenditure:delete:own'
  ]
};

export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Core business logic: Resource ownership validation
export const canAccessResource = (userRole, permission, resourceOwnerId, userId, userBase, resourceBase) => {
  if (hasPermission(userRole, permission)) {
    return true;
  }

  // Check ownership permissions
  if (permission.endsWith(':own') && resourceOwnerId === userId) {
    const basePermission = permission.replace(':own', '');
    return hasPermission(userRole, basePermission);
  }

  // Base-level access for Base Commanders and Logistics Officers
  if (userRole !== ROLES.ADMIN && userBase !== resourceBase) {
    return false;
  }

  return false;
};

// Function expected by usePermissions hook
export const canUserPerformAction = (user, permission, resourceOwner = null) => {
  if (!user || !user.role) return false;
  
  // Check if user has the general permission
  if (hasPermission(user.role, permission)) {
    return true;
  }
  
  // Check for ownership-based permissions
  if (resourceOwner && user._id === resourceOwner) {
    // Convert any permission to own permission if applicable
    const ownPermission = permission.replace('any', 'own');
    if (hasPermission(user.role, ownPermission)) {
      return true;
    }
  }
  
  return false;
};

// Function to get filtered data scope for user
export const getFilteredDataScope = (user) => {
  if (!user) return { scope: 'none' };
  
  if (user.role === ROLES.ADMIN) {
    return { scope: 'all' };
  }
  
  if (user.role === ROLES.BASE_COMMANDER || user.role === ROLES.LOGISTICS_OFFICER) {
    return { scope: 'base', base: user.base };
  }
  
  return { scope: 'own', userId: user._id };
};

export const filterDataByPermissions = (data, userRole, userBase) => {
  if (userRole === ROLES.ADMIN) {
    return data;
  }

  return data.filter(item => {
    if (item.base && item.base !== userBase) return false;
    if (item.requestedBy?.base && item.requestedBy.base !== userBase) return false;
    if (item.sourceBaseId && item.sourceBaseId !== userBase && item.destinationBaseId !== userBase) return false;
    return true;
  });
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessResource,
  canUserPerformAction,
  getFilteredDataScope,
  filterDataByPermissions
}; 