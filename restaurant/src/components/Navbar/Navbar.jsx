import React from 'react';
import './navbar.css';

const Navbar = ({ onLogout }) => {
  const restaurantName = localStorage.getItem('restaurant-name') || 'Restaurant';
  const restaurantCode = localStorage.getItem('restaurant-code') || '';

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h2 className="logo">🍳 FoodFast Kitchen</h2>
        </div>
        <div className="navbar-right">
          <div className="restaurant-info">
            <span className="restaurant-name">{restaurantName}</span>
            {restaurantCode && <span className="restaurant-code">({restaurantCode})</span>}
            <span className="online-status">● Online</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
