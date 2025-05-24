import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth} from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  FaTachometerAlt, 
  FaUserTag, 
  FaExchangeAlt, 
  FaShoppingCart, 
  FaReceipt, 
  FaSignOutAlt,
  FaUser,
  FaShieldAlt
} from 'react-icons/fa';
import './Sidebar.css';



const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isLogisticsOfficer, checkPermission } = usePermissions();
  const navigate = useNavigate();

  console.log('Sidebar Debug - User object:', user);
  console.log('Sidebar Debug - User properties:', user ? Object.keys(user) : 'User is null/undefined');
  console.log('Sidebar Debug - Is Logistics Officer:', isLogisticsOfficer());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to get user name
  const getUserName = () => {
    if (!user) return 'Unknown User';
    
    // Try different possible property combinations
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    } else if (user.email) {
      return user.email;
    }
    return 'Unknown User';
  };

  // Helper function to get user role
  const getUserRole = () => {
    if (!user) return 'Unknown Role';
    return user.role || user.userRole || user.position || 'Unknown Role';
  };

  // Helper function to check if user can access a page
  const canAccessPage = (permission) => {
    return checkPermission(permission);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaShieldAlt className="logo-icon" />
        <h2>Military Management</h2>
      </div>

      <nav className="nav-menu">
        <ul>
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link">
              <FaTachometerAlt className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          {/* Assignments - Show for Admin and Base Commander only */}
          {canAccessPage('assignment:view') && (
            <li className="nav-item">
              <NavLink to="/assignments" className="nav-link">
                <FaUserTag className="nav-icon" />
                <span>Assignments</span>
              </NavLink>
            </li>
          )}
          
          {/* Transfers - Show for all roles */}
          {canAccessPage('transfer:view') && (
            <li className="nav-item">
              <NavLink to="/transfers" className="nav-link">
                <FaExchangeAlt className="nav-icon" />
                <span>Transfers</span>
              </NavLink>
            </li>
          )}
          
          {/* Purchases - Show for all roles */}
          {canAccessPage('purchase:view') && (
            <li className="nav-item">
              <NavLink to="/purchases" className="nav-link">
                <FaShoppingCart className="nav-icon" />
                <span>Purchases</span>
              </NavLink>
            </li>
          )}
          
          {/* Expenditures - Show for Admin and Base Commander only */}
          {canAccessPage('expenditure:view') && !isLogisticsOfficer() && (
            <li className="nav-item">
              <NavLink to="/expenditures" className="nav-link">
                <FaReceipt className="nav-icon" />
                <span>Expenditures</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <FaUser className="user-icon" />
          <div className="user-details">
            <div className="user-name">{getUserName()}</div>
            <div className="user-role">{getUserRole()}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 