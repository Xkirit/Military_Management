import React, { useState, useEffect } from 'react';
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
  FaShieldAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isLogisticsOfficer, checkPermission } = usePermissions();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && !isCollapsed) {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (sidebar && !sidebar.contains(event.target) && !toggleBtn?.contains(event.target)) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close sidebar when navigating on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
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
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          className={`sidebar-toggle ${isCollapsed ? '' : 'active'}`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={() => setIsCollapsed(true)} />
      )}

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <FaShieldAlt className="logo-icon" />
          <h2>Military Management</h2>
        </div>

        <nav className="nav-menu">
          <ul>
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link" onClick={handleNavClick}>
                <FaTachometerAlt className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            
            {/* Assignments - Show for Admin and Base Commander only */}
            {canAccessPage('assignment:view') && (
              <li className="nav-item">
                <NavLink to="/assignments" className="nav-link" onClick={handleNavClick}>
                  <FaUserTag className="nav-icon" />
                  <span>Assignments</span>
                </NavLink>
              </li>
            )}
            
            {/* Transfers - Show for all roles */}
            {canAccessPage('transfer:view') && (
              <li className="nav-item">
                <NavLink to="/transfers" className="nav-link" onClick={handleNavClick}>
                  <FaExchangeAlt className="nav-icon" />
                  <span>Transfers</span>
                </NavLink>
              </li>
            )}
            
            {/* Purchases - Show for all roles */}
            {canAccessPage('purchase:view') && (
              <li className="nav-item">
                <NavLink to="/purchases" className="nav-link" onClick={handleNavClick}>
                  <FaShoppingCart className="nav-icon" />
                  <span>Purchases</span>
                </NavLink>
              </li>
            )}
            
            {/* Expenditures - Show for Admin and Base Commander only */}
            {canAccessPage('expenditure:view') && !isLogisticsOfficer() && (
              <li className="nav-item">
                <NavLink to="/expenditures" className="nav-link" onClick={handleNavClick}>
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
    </>
  );
};

export default Sidebar; 