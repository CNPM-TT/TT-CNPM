import React, { useEffect, useState } from "react";
import "./ListFood.css";
import { DOMAIN } from "../../config";
import { toast } from "react-toastify";
import axios from "axios";

function ListFood() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    const token = localStorage.getItem("restaurant-token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);
      // Get current restaurant's foods using authenticated endpoint
      const response = await axios.get(`${DOMAIN}/api/food/restaurant/my-foods`, {
        headers: { token },
      });

      if (response.data.success) {
        // Filter foods by current restaurant (backend will handle this based on token)
        setList(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching food list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (foodId) => {
    const token = localStorage.getItem("restaurant-token");
    if (!confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      const response = await axios.post(
        `${DOMAIN}/api/food/restaurant/remove`,
        { id: foodId },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("Food deleted successfully");
        fetchList(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting food");
    }
  };

  const handleToggleAvailability = async (food) => {
    const token = localStorage.getItem("restaurant-token");

    try {
      const response = await axios.patch(
        `${DOMAIN}/api/food/restaurant/update/${food._id}`,
        {
          name: food.name,
          price: food.price,
          available: !food.available,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(
          `Food ${!food.available ? "enabled" : "disabled"} successfully`
        );
        fetchList(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating food");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (loading) {
    return (
      <div className="list-food">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="list-food">
        <h2>My Restaurant Menu</h2>
        <p className="food-count">Total Items: {list.length}</p>

        {list.length === 0 ? (
          <div className="empty-state">
            <p>No food items yet. Add your first dish!</p>
          </div>
        ) : (
          <div className="list-table">
            <div className="list-table-format title">
              <b>Image</b>
              <b>Name</b>
              <b>Category</b>
              <b>Price</b>
              <b>Type</b>
              <b>Status</b>
              <b>Action</b>
            </div>
            {list.map((item, index) => {
              return (
                <div className="list-table-format" key={index}>
                  <img
                    className={item.available ? "food-image" : "food-image opacity"}
                    src={item.image}
                    alt={item.name}
                  />
                  <p className={item.available ? "" : "opacity"}>{item.name}</p>
                  <p className={item.available ? "" : "opacity"}>
                    {item.category}
                  </p>
                  <p className={item.available ? "" : "opacity"}>₹{item.price}</p>
                  <p className={item.available ? "" : "opacity"}>
                    {item.veg ? "🥗 Veg" : "🍖 Non-Veg"}
                  </p>
                  <p>
                    <span
                      className={
                        item.available ? "status-badge active" : "status-badge inactive"
                      }
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </p>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className="btn-toggle"
                      title={item.available ? "Mark Unavailable" : "Mark Available"}
                    >
                      {item.available ? "🔴" : "🟢"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-delete"
                      title="Delete Food"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default ListFood;
