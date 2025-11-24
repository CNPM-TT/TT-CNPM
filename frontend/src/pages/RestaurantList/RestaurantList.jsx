import React, { useEffect, useState } from "react";
import "./RestaurantList.css";
import { DOMAIN } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${DOMAIN}/api/restaurant/list`);
      
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return <div className="restaurant-list-loading">Loading restaurants...</div>;
  }

  return (
    <div className="restaurant-list">
      <div className="restaurant-list-header">
        <h1>Explore Restaurants</h1>
        <p>Discover delicious food from top-rated restaurants</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="no-restaurants">
          <p>No restaurants available at the moment.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="restaurant-card"
              onClick={() => handleRestaurantClick(restaurant._id)}
            >
              <div className="restaurant-card-image">
                <img
                  src={`https://ui-avatars.com/api/?name=${restaurant.name}&size=200&background=random`}
                  alt={restaurant.name}
                />
                {restaurant.rating > 0 && (
                  <div className="restaurant-rating">
                    ⭐ {restaurant.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="restaurant-card-content">
                <h3>{restaurant.name}</h3>
                {restaurant.city && (
                  <p className="restaurant-location">
                    📍 {restaurant.city}
                  </p>
                )}
                {restaurant.address && (
                  <p className="restaurant-address">{restaurant.address}</p>
                )}
                <div className="restaurant-stats">
                  <span>🍽️ {restaurant.totalOrders || 0} orders</span>
                  <span className="view-menu">View Menu →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantList;
