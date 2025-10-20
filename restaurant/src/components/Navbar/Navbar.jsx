import React from 'react';
import './navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h2 className="logo">🍳 FoodFast Kitchen</h2>
        </div>
        <div className="navbar-right">
          <div className="restaurant-info">
            <span className="restaurant-name">Main Kitchen</span>
            <span className="online-status">● Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
