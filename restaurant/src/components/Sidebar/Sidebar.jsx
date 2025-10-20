import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className="sidebar-option">
          <span className="icon">📊</span>
          <p>Dashboard</p>
        </NavLink>
        
        <NavLink to="/orders/new" className="sidebar-option">
          <span className="icon">🆕</span>
          <p>New Orders</p>
          <span className="badge">5</span>
        </NavLink>

        <NavLink to="/orders/preparing" className="sidebar-option">
          <span className="icon">👨‍🍳</span>
          <p>Preparing</p>
        </NavLink>

        <NavLink to="/orders/ready" className="sidebar-option">
          <span className="icon">✅</span>
          <p>Ready for Drone</p>
        </NavLink>

        <NavLink to="/orders/completed" className="sidebar-option">
          <span className="icon">📦</span>
          <p>Completed</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
