const ROLES = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer'
};

const PERMISSIONS = {
  // Dashboard permissions
  VIEW_ALL_BASES_DASHBOARD: 'view_all_bases_dashboard',
  VIEW_BASE_DASHBOARD: 'view_base_dashboard',
  
  // User/Personnel permissions
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_BASE_USERS: 'view_base_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Purchase permissions
  VIEW_ALL_PURCHASES: 'view_all_purchases',
  VIEW_BASE_PURCHASES: 'view_base_purchases',
  CREATE_PURCHASE: 'create_purchase',
  UPDATE_OWN_PURCHASE: 'update_own_purchase',
  UPDATE_ANY_PURCHASE: 'update_any_purchase',
  DELETE_OWN_PURCHASE: 'delete_own_purchase',
  DELETE_ANY_PURCHASE: 'delete_any_purchase',
  APPROVE_PURCHASE: 'approve_purchase',
  
  // Transfer permissions
  VIEW_ALL_TRANSFERS: 'view_all_transfers',
  VIEW_BASE_TRANSFERS: 'view_base_transfers',
  CREATE_TRANSFER: 'create_transfer',
  UPDATE_OWN_TRANSFER: 'update_own_transfer',
  UPDATE_ANY_TRANSFER: 'update_any_transfer',
  DELETE_OWN_TRANSFER: 'delete_own_transfer',
  DELETE_ANY_TRANSFER: 'delete_any_transfer',
  APPROVE_TRANSFER: 'approve_transfer',
  
  // Assignment permissions
  VIEW_ALL_ASSIGNMENTS: 'view_all_assignments',
  VIEW_BASE_ASSIGNMENTS: 'view_base_assignments',
  CREATE_ASSIGNMENT: 'create_assignment',
  UPDATE_OWN_ASSIGNMENT: 'update_own_assignment',
  UPDATE_ANY_ASSIGNMENT: 'update_any_assignment',
  DELETE_OWN_ASSIGNMENT: 'delete_own_assignment',
  DELETE_ANY_ASSIGNMENT: 'delete_any_assignment',
  APPROVE_ASSIGNMENT: 'approve_assignment',
  
  // Expenditure permissions
  VIEW_ALL_EXPENDITURES: 'view_all_expenditures',
  VIEW_BASE_EXPENDITURES: 'view_base_expenditures',
  CREATE_EXPENDITURE: 'create_expenditure',
  UPDATE_OWN_EXPENDITURE: 'update_own_expenditure',
  UPDATE_ANY_EXPENDITURE: 'update_any_expenditure',
  DELETE_OWN_EXPENDITURE: 'delete_own_expenditure',
  DELETE_ANY_EXPENDITURE: 'delete_any_expenditure',
  
  // System permissions
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  VIEW_SYSTEM_REPORTS: 'view_system_reports',
  EXPORT_DATA: 'export_data'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin has full access to everything
    PERMISSIONS.VIEW_ALL_BASES_DASHBOARD,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_ALL_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.UPDATE_ANY_PURCHASE,
    PERMISSIONS.DELETE_ANY_PURCHASE,
    PERMISSIONS.APPROVE_PURCHASE,
    PERMISSIONS.VIEW_ALL_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.UPDATE_ANY_TRANSFER,
    PERMISSIONS.DELETE_ANY_TRANSFER,
    PERMISSIONS.APPROVE_TRANSFER,
    PERMISSIONS.VIEW_ALL_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.UPDATE_ANY_ASSIGNMENT,
    PERMISSIONS.DELETE_ANY_ASSIGNMENT,
    PERMISSIONS.APPROVE_ASSIGNMENT,
    PERMISSIONS.VIEW_ALL_EXPENDITURES,
    PERMISSIONS.CREATE_EXPENDITURE,
    PERMISSIONS.UPDATE_ANY_EXPENDITURE,
    PERMISSIONS.DELETE_ANY_EXPENDITURE,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.VIEW_SYSTEM_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.BASE_COMMANDER]: [
    // Base Commander has full access to their base
    PERMISSIONS.VIEW_BASE_DASHBOARD,
    PERMISSIONS.VIEW_BASE_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.VIEW_BASE_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.UPDATE_ANY_PURCHASE,
    PERMISSIONS.DELETE_ANY_PURCHASE,
    PERMISSIONS.APPROVE_PURCHASE,
    PERMISSIONS.VIEW_BASE_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.UPDATE_ANY_TRANSFER,
    PERMISSIONS.DELETE_ANY_TRANSFER,
    PERMISSIONS.APPROVE_TRANSFER,
    PERMISSIONS.VIEW_BASE_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.UPDATE_ANY_ASSIGNMENT,
    PERMISSIONS.DELETE_ANY_ASSIGNMENT,
    PERMISSIONS.APPROVE_ASSIGNMENT,
    PERMISSIONS.VIEW_BASE_EXPENDITURES,
    PERMISSIONS.CREATE_EXPENDITURE,
    PERMISSIONS.UPDATE_ANY_EXPENDITURE,
    PERMISSIONS.DELETE_ANY_EXPENDITURE,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.LOGISTICS_OFFICER]: [
    // Logistics Officer has limited access, mainly to purchases and transfers
    PERMISSIONS.VIEW_BASE_DASHBOARD,
    PERMISSIONS.VIEW_BASE_USERS,
    PERMISSIONS.VIEW_BASE_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.UPDATE_OWN_PURCHASE,
    PERMISSIONS.DELETE_OWN_PURCHASE,
    PERMISSIONS.VIEW_BASE_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.UPDATE_OWN_TRANSFER,
    PERMISSIONS.DELETE_OWN_TRANSFER,
    PERMISSIONS.VIEW_BASE_ASSIGNMENTS,
    PERMISSIONS.VIEW_BASE_EXPENDITURES,
    PERMISSIONS.CREATE_EXPENDITURE,
    PERMISSIONS.UPDATE_OWN_EXPENDITURE,
    PERMISSIONS.DELETE_OWN_EXPENDITURE
  ]
};

// Helper function to check if a role has a specific permission
const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Helper function to check if a user can perform an action on a resource
const canUserPerformAction = (user, permission, resourceOwner = null) => {
  if (!user || !user.role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Check if user has the general permission
  if (userPermissions.includes(permission)) {
    return true;
  }
  
  // Check for "own" permissions when user is the resource owner
  if (resourceOwner && user._id.toString() === resourceOwner.toString()) {
    const ownPermission = permission.replace('_any_', '_own_');
    if (userPermissions.includes(ownPermission)) {
      return true;
    }
  }
  
  return false;
};

// Middleware to check permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!hasPermission(user.role, permission)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permission,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error checking permissions' });
    }
  };
};

// Middleware to check role-based access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Insufficient role privileges',
          required: allowedRoles,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error checking role' });
    }
  };
};

// Middleware to check if user can access resource
const checkResourceAccess = (permission, getResourceOwner) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const resourceOwner = await getResourceOwner(req);
      
      if (!canUserPerformAction(user, permission, resourceOwner)) {
        return res.status(403).json({ 
          message: 'Cannot access this resource',
          required: permission,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error checking resource access' });
    }
  };
};

// Middleware to filter data based on user scope
const applyDataFilter = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin can see all data
  if (user.role === ROLES.ADMIN) {
    req.dataFilter = {};
    return next();
  }

  // Base Commander and Logistics Officer can only see their base data
  if (user.role === ROLES.BASE_COMMANDER || user.role === ROLES.LOGISTICS_OFFICER) {
    req.dataFilter = { base: user.base };
    return next();
  }

  // Default: no data access
  req.dataFilter = { _id: null };
  next();
};

// Convenience middleware functions
const adminOnly = requireRole([ROLES.ADMIN]);
const commandersAndAbove = requireRole([ROLES.ADMIN, ROLES.BASE_COMMANDER]);
const allRoles = requireRole([ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER]);

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canUserPerformAction,
  checkPermission,
  requireRole,
  checkResourceAccess,
  applyDataFilter,
  adminOnly,
  commandersAndAbove,
  allRoles
}; 