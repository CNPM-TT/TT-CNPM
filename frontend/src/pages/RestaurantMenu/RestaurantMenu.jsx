import React, { useEffect, useState, useContext } from "react";
import "./RestaurantMenu.css";
import { DOMAIN } from "../../config";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import FoodItem from "../../components/FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContext";

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const { cartItems } = useContext(StoreContext);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(`${DOMAIN}/api/restaurant/${id}`);
      if (response.data.success) {
        setRestaurant(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchRestaurantMenu = async () => {
    try {
      const response = await axios.get(`${DOMAIN}/api/food/restaurant/${id}`);
      if (response.data.success) {
        setFoods(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
    fetchRestaurantMenu();
  }, [id]);

  // Get unique categories
  const categories = ["All", ...new Set(foods.map((food) => food.category))];

  // Filter foods by category
  const filteredFoods =
    category === "All"
      ? foods
      : foods.filter((food) => food.category === category);

  // Get cart count for this restaurant
  const getCartCount = () => {
    return Object.keys(cartItems).reduce((total, itemId) => {
      const food = foods.find((f) => f._id === itemId);
      if (food) {
        return total + cartItems[itemId];
      }
      return total;
    }, 0);
  };

  if (loading) {
    return <div className="restaurant-menu-loading">Loading menu...</div>;
  }

  if (!restaurant) {
    return (
      <div className="restaurant-menu-error">
        <p>Restaurant not found</p>
        <button onClick={() => navigate("/restaurants")}>
          Back to Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-menu">
      {/* Restaurant Header */}
      <div className="restaurant-menu-header">
        <button className="back-button" onClick={() => navigate("/restaurants")}>
          ← Back to Restaurants
        </button>
        <div className="restaurant-info">
          <h1>{restaurant.name}</h1>
          <div className="restaurant-meta">
            {restaurant.city && <span>📍 {restaurant.city}</span>}
            {restaurant.rating > 0 && (
              <span>⭐ {restaurant.rating.toFixed(1)}</span>
            )}
            <span>🍽️ {restaurant.totalOrders || 0} orders</span>
          </div>
          {restaurant.address && (
            <p className="restaurant-address">{restaurant.address}</p>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="menu-categories">
        <h2>Menu Categories</h2>
        <div className="category-list">
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "category-btn active" : "category-btn"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items */}
      <div className="menu-items">
        <h2>
          {category === "All" ? "All Items" : category}
          <span className="item-count">({filteredFoods.length} items)</span>
        </h2>

        {filteredFoods.length === 0 ? (
          <div className="no-items">
            <p>No items available in this category</p>
          </div>
        ) : (
          <div className="food-display-list">
            {filteredFoods.map((food) => (
              <FoodItem
                key={food._id}
                id={food._id}
                name={food.name}
                price={food.price}
                description={food.description}
                image={food.image}
                category={food.category}
                available={food.available}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Float Button */}
      {getCartCount() > 0 && (
        <div className="cart-float-button" onClick={() => navigate("/cart")}>
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{getCartCount()} items</span>
          <span className="view-cart">View Cart →</span>
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;
