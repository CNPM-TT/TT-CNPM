import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../config';
import './sidebar.css';

const Sidebar = () => {
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      const token = localStorage.getItem("restaurant-token");
      if (!token) return;

      try {
        const response = await axios.get(`${url}/api/order/restaurant/my-orders`, {
          headers: { token },
        });
        
        if (response.data.success) {
          const newOrders = response.data.data.filter(order => 
            order.status === 'Food Processing' || order.status === 'Placed'
          );
          setNewOrdersCount(newOrders.length);
        }
      } catch (error) {
        console.error('Error fetching orders count:', error);
      }
    };

    fetchNewOrdersCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchNewOrdersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className="sidebar-option">
          <span className="icon">📊</span>
          <p>Dashboard</p>
        </NavLink>

        <NavLink to="/add-food" className="sidebar-option">
          <span className="icon">🍽️</span>
          <p>Add Food</p>
        </NavLink>

        <NavLink to="/list-food" className="sidebar-option">
          <span className="icon">📋</span>
          <p>My Menu</p>
        </NavLink>
        
        <NavLink to="/orders/new" className="sidebar-option">
          <span className="icon">🆕</span>
          <p>New Orders</p>
          {newOrdersCount > 0 && <span className="badge">{newOrdersCount}</span>}
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
