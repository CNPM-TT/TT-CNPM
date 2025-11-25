import { useEffect, useState } from "react";
import "./restaurants.css";
import axios from "axios";
import { DOMAIN } from "../../config";
import { toast } from "react-toastify";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const buildStats = (list, serverStats) => {
    if (serverStats && Number.isFinite(serverStats.total) && Number.isFinite(serverStats.active)) {
      const inactive = Number.isFinite(serverStats.inactive)
        ? serverStats.inactive
        : Math.max(serverStats.total - serverStats.active, 0);

      return { total: serverStats.total, active: serverStats.active, inactive };
    }

    const active = list.filter((restaurant) => restaurant.isActive).length;
    return {
      total: list.length,
      active,
      inactive: list.length - active
    };
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      // Always use the dedicated admin endpoint to get ALL restaurants
      const response = await axios.get(`${DOMAIN}/api/restaurant/admin/list`);
      
      console.log('Admin fetched restaurants:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`Total restaurants fetched: ${response.data.data.length}`);
        setRestaurants(response.data.data);
        setStats(buildStats(response.data.data, response.data.stats));
      } else {
        toast.error(response.data.message || "Failed to fetch restaurants");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to fetch restaurants. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
    try {
      const response = await axios.post(`${DOMAIN}/api/restaurant/toggleStatus`, {
        restaurantId,
        isActive: !currentStatus
      });
      
      if (response.data.success) {
        toast.success(response.data.message);

        // Update the restaurant in the list without removing it
        setRestaurants((prev) => {
          const updatedList = prev.map((restaurant) => {
            if (restaurant._id === restaurantId) {
              return { ...restaurant, isActive: !currentStatus };
            }
            return restaurant;
          });
          
          // Update stats from server response or recalculate
          setStats(buildStats(updatedList, response.data.stats));
          return updatedList;
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error toggling restaurant status:", error);
      toast.error("Failed to update restaurant status");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="restaurants add">
        <h3>Restaurant Management</h3>
        <p className="loading-text">Loading restaurants...</p>
      </div>
    );
  }

  const totalCount = stats.total ?? restaurants.length;
  const activeCount = stats.active ?? restaurants.filter((r) => r.isActive).length;
  const inactiveCount = stats.inactive ?? restaurants.filter((r) => !r.isActive).length;

  return (
    <div className="restaurants add">
      <div className="restaurants-header">
        <h3>Restaurant Management</h3>
        <div className="restaurants-stats">
          <div className="stat-item">
            <span className="stat-label">Total Restaurants:</span>
            <span className="stat-value">{totalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active:</span>
            <span className="stat-value active">{activeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Inactive:</span>
            <span className="stat-value inactive">{inactiveCount}</span>
          </div>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="no-restaurants">
          <p>No restaurants registered yet.</p>
        </div>
      ) : (
        <div className="restaurants-table-container">
          <table className="restaurants-table">
            <thead>
              <tr>
                <th>Restaurant Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Total Orders</th>
                <th>Status</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id} className={restaurant.isActive ? 'active-row' : 'inactive-row'}>
                  <td className="restaurant-code">{restaurant.restaurantCode}</td>
                  <td className="restaurant-name">{restaurant.name}</td>
                  <td className="restaurant-email">{restaurant.email}</td>
                  <td>{restaurant.phoneNumber || 'N/A'}</td>
                  <td>{restaurant.city || 'N/A'}</td>
                  <td className="restaurant-address">{restaurant.address || 'N/A'}</td>
                  <td className="restaurant-rating">
                    {restaurant.rating > 0 ? (
                      <span className="rating-badge">⭐ {restaurant.rating.toFixed(1)}</span>
                    ) : (
                      <span className="no-rating">No ratings</span>
                    )}
                  </td>
                  <td className="text-center">{restaurant.totalOrders || 0}</td>
                  <td>
                    <button 
                      className={`status-toggle-btn ${restaurant.isActive ? 'btn-active' : 'btn-inactive'}`}
                      onClick={() => toggleRestaurantStatus(restaurant._id, restaurant.isActive)}
                      title={restaurant.isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {restaurant.isActive ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td className="restaurant-date">{formatDate(restaurant.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Restaurants;
