import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../config';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    newOrders: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        const orders = response.data.data;
        
        setStats({
          newOrders: orders.filter(order => order.status === 'Food Processing' && order.payment).length,
          preparing: orders.filter(order => order.status === 'Preparing').length,
          ready: orders.filter(order => order.status === 'Ready for Pickup').length,
          completed: orders.filter(order => order.status === 'Delivered').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'New Orders',
      value: stats.newOrders,
      icon: '🆕',
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
    {
      title: 'Preparing',
      value: stats.preparing,
      icon: '👨‍🍳',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Ready for Drone',
      value: stats.ready,
      icon: '✅',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Completed Today',
      value: stats.completed,
      icon: '📦',
      color: '#667eea',
      bgColor: '#e0e7ff'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Kitchen Dashboard</h1>
        <p>Monitor and manage your food preparation workflow</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ borderColor: card.color }}
          >
            <div className="stat-icon" style={{ backgroundColor: card.bgColor }}>
              <span style={{ fontSize: '32px' }}>{card.icon}</span>
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn new-orders">
            <span>🆕</span>
            View New Orders
          </button>
          <button className="action-btn preparing">
            <span>👨‍🍳</span>
            Preparing Orders
          </button>
          <button className="action-btn ready">
            <span>🚁</span>
            Ready for Drone
          </button>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>🚁 Drone Delivery System</h3>
          <p>All orders are automatically assigned to drone delivery once marked as "Ready for Pickup"</p>
        </div>
        <div className="info-card">
          <h3>⏱️ Average Prep Time</h3>
          <p>Keep preparation time under 15 minutes for optimal service</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
