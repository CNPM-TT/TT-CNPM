import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../config';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    newOrders: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('restaurant-token');
      
      if (!token) {
        console.error('❌ No restaurant token found');
        return;
      }

      // Use restaurant-specific endpoint to get only this restaurant's orders
      const response = await axios.get(`${url}/api/order/restaurant/my-orders`, {
        headers: { token }
      });
      
      if (response.data.success) {
        const orders = response.data.data;
        let restaurantId = localStorage.getItem('restaurant-id'); // Get current restaurant ID
        
        // If restaurant-id not in localStorage, extract from first order
        if (!restaurantId && orders.length > 0 && orders[0].restaurantIds && orders[0].restaurantIds.length > 0) {
          restaurantId = orders[0].restaurantIds[0].toString();
          localStorage.setItem('restaurant-id', restaurantId);
        }
        
        const newOrdersCount = orders.filter(order => order.status === 'Food Processing' && order.payment).length;
        const preparingCount = orders.filter(order => order.status === 'Preparing').length;
        const readyCount = orders.filter(order => order.status === 'Ready for Pickup').length;
        const completedCount = orders.filter(order => order.status === 'Delivered').length;
        
        // Calculate revenue for this restaurant only
        let totalRevenue = 0;
        let todayRevenue = 0;
        const today = new Date().setHours(0, 0, 0, 0);
        
        orders.forEach(order => {
          if (order.payment || order.cod) {
            let orderRevenue = 0;
            
            // Try to get revenue from amountByRestaurant (new orders)
            if (order.amountByRestaurant && restaurantId) {
              // amountByRestaurant is a Map in MongoDB but becomes Object in JSON
              if (typeof order.amountByRestaurant === 'object') {
                const mapSize = Object.keys(order.amountByRestaurant).length;
                if (mapSize > 0) {
                  orderRevenue = order.amountByRestaurant[restaurantId] || 0;
                }
              }
            }
            
            // If no revenue found from amountByRestaurant, calculate from items
            if (orderRevenue === 0 && order.items) {
              order.items.forEach(item => {
                // Handle both populated (object) and unpopulated (string) restaurantId
                let itemRestId;
                if (typeof item.restaurantId === 'object' && item.restaurantId !== null) {
                  itemRestId = item.restaurantId._id?.toString() || item.restaurantId.toString();
                } else {
                  itemRestId = item.restaurantId?.toString();
                }
                
                if (itemRestId === restaurantId) {
                  const itemRevenue = (item.price || 0) * (item.quantity || 1);
                  orderRevenue += itemRevenue;
                }
              });
            }
            
            totalRevenue += orderRevenue;
            
            // Check if order is from today
            const orderDate = new Date(order.date || order.createdAt).setHours(0, 0, 0, 0);
            if (orderDate === today) {
              todayRevenue += orderRevenue;
            }
          }
        });
        
        setStats({
          newOrders: newOrdersCount,
          preparing: preparingCount,
          ready: readyCount,
          completed: completedCount,
          totalRevenue: totalRevenue,
          todayRevenue: todayRevenue
        });
      } else {
        console.error('❌ API returned success: false', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
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
    },
    {
      title: 'Today Revenue',
      value: `₹${stats.todayRevenue.toFixed(2)}`,
      icon: '💵',
      color: '#059669',
      bgColor: '#d1fae5'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: '#7c3aed',
      bgColor: '#ede9fe'
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
