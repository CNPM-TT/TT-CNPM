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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const activeRestaurants = restaurants.filter(r => r.isActive);
  const inactiveRestaurants = restaurants.filter(r => !r.isActive);

  if (loading) {
    return (
      <div className="restaurants">
        <h2>Restaurant Management</h2>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="restaurants">
      <h2>Restaurant Management</h2>
      
      <div className="restaurant-stats">
        <div className="stat-card">
          <h3>Total Restaurants:</h3>
          <p className="stat-number">{restaurants.length}</p>
        </div>
        <div className="stat-card active">
          <h3>Active:</h3>
          <p className="stat-number">{activeRestaurants.length}</p>
        </div>
        <div className="stat-card inactive">
          <h3>Inactive:</h3>
          <p className="stat-number">{inactiveRestaurants.length}</p>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <p className="no-data">No restaurants registered yet.</p>
      ) : (
        <div className="restaurant-table-container">
          <table className="restaurant-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td>
                    <span className="restaurant-code">{restaurant.restaurantCode}</span>
                  </td>
                  <td className="restaurant-name">{restaurant.name}</td>
                  <td>{restaurant.email}</td>
                  <td>{restaurant.phoneNumber}</td>
                  <td>{restaurant.city}</td>
                  <td className="restaurant-address">{restaurant.address}</td>
                  <td>
                    <span className="rating">
                      ⭐ {restaurant.rating?.toFixed(1) || '0.0'}
                    </span>
                  </td>
                  <td className="text-center">{restaurant.totalOrders || 0}</td>
                  <td>
                    <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(restaurant.createdAt)}</td>
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
