import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/purchases',
      name: 'Purchases',
      icon: '🛍️'
    },
    {
      path: '/transfers',
      name: 'Transfers',
      icon: '🔄'
    },
    {
      path: '/assignments',
      name: 'Assignments',
      icon: '👥'
    },
    {
      path: '/expenditures',
      name: 'Expenditures',
      icon: '💰'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Military Management</h2>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
          {user?.assignedBase && (
            <span className="user-base">Base: {user.assignedBase}</span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar; 