import { useEffect, useState } from "react";
import "./restaurants.css";
import axios from "axios";
import { DOMAIN } from "../../config";
import { toast } from "react-toastify";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${DOMAIN}/api/restaurant/list`);
      
      if (response.data.success) {
        setRestaurants(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
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

  return (
    <div className="restaurants add">
      <div className="restaurants-header">
        <h3>Restaurant Management</h3>
        <div className="restaurants-stats">
          <div className="stat-item">
            <span className="stat-label">Total Restaurants:</span>
            <span className="stat-value">{restaurants.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active:</span>
            <span className="stat-value active">{restaurants.filter(r => r.isActive).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Inactive:</span>
            <span className="stat-value inactive">{restaurants.filter(r => !r.isActive).length}</span>
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
                    <span className={`status-badge ${restaurant.isActive ? 'status-active' : 'status-inactive'}`}>
                      {restaurant.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
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
