import { useState, useEffect } from 'react';
import axios from 'axios';
import { DOMAIN } from '../../config';
import './Dashboard.css';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    unpaidInvoices: 0,
    todaySales: 0,
    todayOrders: 0,
    todayCustomers: 0,
  });
  
  const [lowStockItems, setLowStockItems] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await axios.get(`${DOMAIN}/api/order/list`);
      const orders = ordersRes.data.data || [];
      
      // Fetch users
      const usersRes = await axios.get(`${DOMAIN}/api/user/list`);
      const users = usersRes.data.data || [];
      
      // Fetch food items for stock
      const foodRes = await axios.get(`${DOMAIN}/api/food/list`);
      const foodItems = foodRes.data.data || [];

      // Calculate stats
      const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = users.length;
      const unpaidOrders = orders.filter(order => !order.payment).length;
      const unpaidAmount = orders
        .filter(order => !order.payment)
        .reduce((sum, order) => sum + (order.amount || 0), 0);

      // Today's stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.date).toDateString() === today
      );
      const todaySales = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const todayUsers = users.filter(user => 
        new Date(user.createdAt).toDateString() === today
      ).length;

      // Low stock items (less than 10)
      const lowStock = foodItems.filter(item => (item.stock || 0) < 10);

      // Sales by date for chart
      const salesByDate = {};
      orders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        salesByDate[date] = (salesByDate[date] || 0) + (order.amount || 0);
      });

      setStats({
        totalSales,
        totalOrders,
        totalCustomers,
        unpaidInvoices: unpaidAmount,
        todaySales,
        todayOrders: todayOrders.length,
        todayCustomers: todayUsers,
      });

      setLowStockItems(lowStock);
      setSalesData(Object.entries(salesByDate).map(([date, amount]) => ({ date, amount })));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  const calculatePercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hi! Dashboard</h1>
        <p className="subtitle">Quickly Review what's going on in your store</p>
        <div className="date-filter">
          <input 
            type="date" 
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
          <input 
            type="date" 
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>
      </div>

      <div className="dashboard-content">
        {/* Overall Details */}
        <div className="dashboard-section overall-stats-section">
          <h2>Overall Details</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalSales)}</h3>
                <p>Total Sales</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalCustomers}</h3>
                <p>Total Customers</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💳</div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.unpaidInvoices)}</h3>
                <p>Total Unpaid Invoices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Details */}
        <div className="dashboard-section today-details-section">
          <h2>Today's Details</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.todaySales)}</h3>
                <p>Today's Sales</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.todayOrders}</h3>
                <p>Today's Orders</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.todayCustomers}</h3>
                <p>Today's Customers</p>
                <span className="stat-change positive">↑ 0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-section charts-section">
          <h2>Sales Analytics</h2>
          <div className="chart-header">
            <div className="chart-title-row">
              <h3>Total Sales</h3>
              <span className="date-range">{dateRange.startDate} - {dateRange.endDate}</span>
            </div>
            <div className="chart-stats-row">
              <div className="chart-stat">
                <p className="total-amount">{formatCurrency(stats.totalSales)}</p>
                <p className="total-orders">{stats.totalOrders} Orders</p>
              </div>
              <div className="chart-stat">
                <p className="avg-order-value">Avg: {formatCurrency(stats.totalSales / stats.totalOrders || 0)}</p>
              </div>
            </div>
          </div>
          <div className="simple-chart">
            {salesData.length === 0 ? (
              <p className="no-data">No sales data available</p>
            ) : (
              <div className="chart-container">
                <div className="chart-y-axis">
                  <div className="y-axis-label">1.0</div>
                  <div className="y-axis-label">0.8</div>
                  <div className="y-axis-label">0.6</div>
                  <div className="y-axis-label">0.4</div>
                  <div className="y-axis-label">0.2</div>
                  <div className="y-axis-label">0</div>
                </div>
                <div className="chart-bars">
                  {salesData.slice(-20).map((data, index) => {
                    const dateObj = new Date(data.date);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleString('en', { month: 'short' });
                    return (
                      <div key={index} className="chart-bar-wrapper">
                        <div 
                          className="chart-bar"
                          style={{
                            height: `${(data.amount / Math.max(...salesData.map(d => d.amount))) * 100}%`
                          }}
                          title={`${data.date}: ${formatCurrency(data.amount)}`}
                        ></div>
                        <span className="chart-label">{`${day} ${month}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {salesData.length > 0 && (
            <div className="chart-summary">
              <div className="summary-item">
                <span className="summary-label">Peak Day:</span>
                <span className="summary-value">
                  {formatCurrency(Math.max(...salesData.map(d => d.amount)))}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average:</span>
                <span className="summary-value">
                  {formatCurrency(salesData.reduce((sum, d) => sum + d.amount, 0) / salesData.length)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Days Active:</span>
                <span className="summary-value">{salesData.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stock Threshold */}
        <div className="dashboard-section stock-alerts-section">
          <h2>Stock Threshold</h2>
          <div className="stock-list">
            {lowStockItems.length === 0 ? (
              <p className="no-data">All items are well stocked! 🎉</p>
            ) : (
              lowStockItems.map((item) => {
                // Check if image is a full URL (Cloudinary) or local filename
                const imageUrl = item.image?.startsWith('http') 
                  ? item.image 
                  : `${DOMAIN}/images/${item.image}`;
                
                return (
                  <div key={item._id} className="stock-item">
                    <img 
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                    <div className="stock-info">
                      <h4>{item.name}</h4>
                      <p>SKU - {item._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="stock-price">
                      <h4>{formatCurrency(item.price)}</h4>
                      <p className="stock-count low">{item.stock || 0} Stock</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
