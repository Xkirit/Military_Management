import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const RoleBasedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null,
  allowedRoles = [],
  fallbackPath = '/dashboard',
  showError = false 
}) => {
  const { user, checkPermission, isAdmin, isBaseCommander, isLogisticsOfficer } = usePermissions();

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check specific permission if provided
  if (requiredPermission && !checkPermission(requiredPermission)) {
    if (showError) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
          <p>Required permission: {requiredPermission}</p>
          <p>Your role: {user.role}</p>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Check specific role if provided
  if (requiredRole && user.role !== requiredRole) {
    if (showError) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have the required role to access this resource.</p>
          <p>Required role: {requiredRole}</p>
          <p>Your role: {user.role}</p>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user role is in allowed roles array
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (showError) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have the required role to access this resource.</p>
          <p>Allowed roles: {allowedRoles.join(', ')}</p>
          <p>Your role: {user.role}</p>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // If all checks pass, render the children
  return children;
};

// Convenience components for specific roles
export const AdminRoute = ({ children, fallbackPath = '/dashboard', showError = false }) => (
  <RoleBasedRoute 
    requiredRole="Admin" 
    fallbackPath={fallbackPath} 
    showError={showError}
  >
    {children}
  </RoleBasedRoute>
);

export const BaseCommanderRoute = ({ children, fallbackPath = '/dashboard', showError = false }) => (
  <RoleBasedRoute 
    allowedRoles={['Admin', 'Base Commander']} 
    fallbackPath={fallbackPath} 
    showError={showError}
  >
    {children}
  </RoleBasedRoute>
);

export const LogisticsRoute = ({ children, fallbackPath = '/dashboard', showError = false }) => (
  <RoleBasedRoute 
    allowedRoles={['Admin', 'Base Commander', 'Logistics Officer']} 
    fallbackPath={fallbackPath} 
    showError={showError}
  >
    {children}
  </RoleBasedRoute>
);

export default RoleBasedRoute; 