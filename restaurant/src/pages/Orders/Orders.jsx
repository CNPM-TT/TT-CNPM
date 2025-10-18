import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';
import './orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // new, preparing, ready, completed

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(`${url}/api/order/update`, {
        orderId,
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Order updated to: ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'new':
        return orders.filter(order => order.status === 'Food Processing' && order.payment);
      case 'preparing':
        return orders.filter(order => order.status === 'Preparing');
      case 'ready':
        return orders.filter(order => order.status === 'Ready for Pickup');
      case 'completed':
        return orders.filter(order => order.status === 'Out for Delivery' || order.status === 'Delivered');
      default:
        return orders;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Food Processing':
        return '#ef4444';
      case 'Preparing':
        return '#f59e0b';
      case 'Ready for Pickup':
        return '#10b981';
      case 'Out for Delivery':
        return '#3b82f6';
      case 'Delivered':
        return '#667eea';
      default:
        return '#6b7280';
    }
  };

  const renderOrderActions = (order) => {
    if (order.status === 'Food Processing') {
      return (
        <button 
          className="btn-start"
          onClick={() => updateOrderStatus(order._id, 'Preparing')}
        >
          👨‍🍳 Start Preparing
        </button>
      );
    } else if (order.status === 'Preparing') {
      return (
        <button 
          className="btn-ready"
          onClick={() => updateOrderStatus(order._id, 'Ready for Pickup')}
        >
          ✅ Mark Ready
        </button>
      );
    } else if (order.status === 'Ready for Pickup') {
      return (
        <button 
          className="btn-dispatch"
          onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
        >
          🚁 Dispatch Drone
        </button>
      );
    } else {
      return (
        <span className="status-badge completed">
          ✓ Completed
        </span>
      );
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Kitchen Orders</h1>
        <button className="btn-refresh" onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          🆕 New ({orders.filter(o => o.status === 'Food Processing' && o.payment).length})
        </button>
        <button 
          className={`tab ${activeTab === 'preparing' ? 'active' : ''}`}
          onClick={() => setActiveTab('preparing')}
        >
          👨‍🍳 Preparing ({orders.filter(o => o.status === 'Preparing').length})
        </button>
        <button 
          className={`tab ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          ✅ Ready ({orders.filter(o => o.status === 'Ready for Pickup').length})
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          📦 Completed ({orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Delivered').length})
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders in this category</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <span className="order-time">
                  {new Date(order.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span>Customer:</span>
                  <span className="info-value">{order.address.name}</span>
                </div>
                <div className="info-row">
                  <span>Total:</span>
                  <span className="info-value">₹{order.amount}</span>
                </div>
                <div className="info-row">
                  <span>Payment:</span>
                  <span className={`payment-badge ${order.payment ? 'paid' : 'unpaid'}`}>
                    {order.payment ? '✓ Paid' : 'COD'}
                  </span>
                </div>
              </div>

              <div className="order-actions">
                {renderOrderActions(order)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
