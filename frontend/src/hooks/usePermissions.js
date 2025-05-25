import { useAuth } from '../contexts/AuthContext';
import { hasPermission, canUserPerformAction, getFilteredDataScope, PERMISSIONS } from '../config/roles';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (permission) => {
    return hasPermission(user?.role, permission);
  };

  const canPerformAction = (permission, resourceOwner = null) => {
    return canUserPerformAction(user, permission, resourceOwner);
  };

  const getDataScope = () => {
    return getFilteredDataScope(user);
  };

  const canViewAllBases = () => {
    return checkPermission(PERMISSIONS.VIEW_ALL_BASES_DASHBOARD);
  };

  const canManageUsers = () => {
    return checkPermission(PERMISSIONS.CREATE_USER) || checkPermission(PERMISSIONS.UPDATE_USER);
  };

  const canApprovePurchases = () => {
    return checkPermission(PERMISSIONS.APPROVE_PURCHASE);
  };

  const canApproveTransfers = () => {
    return checkPermission(PERMISSIONS.APPROVE_TRANSFER);
  };

  const canApproveAssignments = () => {
    return checkPermission(PERMISSIONS.APPROVE_ASSIGNMENT);
  };

  const canCreatePurchase = () => {
    return checkPermission(PERMISSIONS.CREATE_PURCHASE);
  };

  const canCreateTransfer = () => {
    return checkPermission(PERMISSIONS.CREATE_TRANSFER);
  };

  const canCreateAssignment = () => {
    return checkPermission(PERMISSIONS.CREATE_ASSIGNMENT);
  };

  const canCreateExpenditure = () => {
    return checkPermission(PERMISSIONS.CREATE_EXPENDITURE);
  };

  const canUpdatePurchase = (purchaseOwner) => {
    return canPerformAction(PERMISSIONS.UPDATE_ANY_PURCHASE, purchaseOwner) ||
           canPerformAction(PERMISSIONS.UPDATE_OWN_PURCHASE, purchaseOwner);
  };

  const canDeletePurchase = (purchaseOwner) => {
    return canPerformAction(PERMISSIONS.DELETE_ANY_PURCHASE, purchaseOwner) ||
           canPerformAction(PERMISSIONS.DELETE_OWN_PURCHASE, purchaseOwner);
  };

  const canUpdateTransfer = (transferOwner) => {
    return canPerformAction(PERMISSIONS.UPDATE_ANY_TRANSFER, transferOwner) ||
           canPerformAction(PERMISSIONS.UPDATE_OWN_TRANSFER, transferOwner);
  };

  const canDeleteTransfer = (transferOwner) => {
    return canPerformAction(PERMISSIONS.DELETE_ANY_TRANSFER, transferOwner) ||
           canPerformAction(PERMISSIONS.DELETE_OWN_TRANSFER, transferOwner);
  };

  const canUpdateAssignment = (assignmentOwner) => {
    return canPerformAction(PERMISSIONS.UPDATE_ANY_ASSIGNMENT, assignmentOwner) ||
           canPerformAction(PERMISSIONS.UPDATE_OWN_ASSIGNMENT, assignmentOwner);
  };

  const canDeleteAssignment = (assignmentOwner) => {
    return canPerformAction(PERMISSIONS.DELETE_ANY_ASSIGNMENT, assignmentOwner) ||
           canPerformAction(PERMISSIONS.DELETE_OWN_ASSIGNMENT, assignmentOwner);
  };

  const canUpdateAssignmentStatus = (assignmentOwner) => {
    // Admin and Base Commander can always update assignment status
    if (isAdmin() || isBaseCommander()) {
      return true;
    }
    // Otherwise, check if user can update the assignment
    return canUpdateAssignment(assignmentOwner);
  };

  const canUpdateExpenditure = (expenditureOwner) => {
    return canPerformAction(PERMISSIONS.UPDATE_ANY_EXPENDITURE, expenditureOwner) ||
           canPerformAction(PERMISSIONS.UPDATE_OWN_EXPENDITURE, expenditureOwner);
  };

  const canDeleteExpenditure = (expenditureOwner) => {
    return canPerformAction(PERMISSIONS.DELETE_ANY_EXPENDITURE, expenditureOwner) ||
           canPerformAction(PERMISSIONS.DELETE_OWN_EXPENDITURE, expenditureOwner);
  };

  const canAccessAdminPanel = () => {
    return checkPermission(PERMISSIONS.ACCESS_ADMIN_PANEL);
  };

  const canExportData = () => {
    return checkPermission(PERMISSIONS.EXPORT_DATA);
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const isBaseCommander = () => {
    return user?.role === 'Base Commander';
  };

  const isLogisticsOfficer = () => {
    return user?.role === 'Logistics Officer';
  };

  const getRoleDisplayName = () => {
    return user?.role || 'Unknown';
  };

  const getBaseDisplayName = () => {
    return user?.base || 'Unknown';
  };

  return {
    user,
    checkPermission,
    canPerformAction,
    getDataScope,
    canViewAllBases,
    canManageUsers,
    canApprovePurchases,
    canApproveTransfers,
    canApproveAssignments,
    canCreatePurchase,
    canCreateTransfer,
    canCreateAssignment,
    canCreateExpenditure,
    canUpdatePurchase,
    canDeletePurchase,
    canUpdateTransfer,
    canDeleteTransfer,
    canUpdateAssignment,
    canDeleteAssignment,
    canUpdateAssignmentStatus,
    canUpdateExpenditure,
    canDeleteExpenditure,
    canAccessAdminPanel,
    canExportData,
    isAdmin,
    isBaseCommander,
    isLogisticsOfficer,
    getRoleDisplayName,
    getBaseDisplayName
  };
}; 