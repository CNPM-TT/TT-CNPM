import React from "react";
import "./orders.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { useState } from "react";
import { DOMAIN } from "../../config";
import { useEffect } from "react";
import { toast } from "react-toastify";
function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${DOMAIN}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(`${DOMAIN}/api/order/update`, {
        orderId,
        status: e.target.value,
      });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  const filterOrders = (status) => {
    setStatusFilter(status);
    if (status === "All") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);
  return (
    <>
      <div className="order add">
        <h3>Order Management</h3>
        
        {/* Filter buttons */}
        <div className="order-filters">
          <button 
            className={statusFilter === "All" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("All")}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={statusFilter === "Food Processing" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("Food Processing")}
          >
            Processing ({orders.filter(o => o.status === "Food Processing").length})
          </button>
          <button 
            className={statusFilter === "Preparing" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("Preparing")}
          >
            Preparing ({orders.filter(o => o.status === "Preparing").length})
          </button>
          <button 
            className={statusFilter === "Ready for Pickup" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("Ready for Pickup")}
          >
            Ready ({orders.filter(o => o.status === "Ready for Pickup").length})
          </button>
          <button 
            className={statusFilter === "Out for Delivery" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("Out for Delivery")}
          >
            Out for Delivery ({orders.filter(o => o.status === "Out for Delivery").length})
          </button>
          <button 
            className={statusFilter === "Delivered" ? "filter-btn active" : "filter-btn"}
            onClick={() => filterOrders("Delivered")}
          >
            Delivered ({orders.filter(o => o.status === "Delivered").length})
          </button>
        </div>

        <div className="order-list">
          {filteredOrders.length === 0 ? (
            <p className="no-orders">No orders found</p>
          ) : (
            filteredOrders.reverse().map((order, index) => (
            <div key={index} className="order-item">
              <img src={assets.parcel_icon} alt="parcel" />
              <div>
                <p className="order-item-food">
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " x" + item.quantity;
                    } else {
                      return item.name + " x" + item.quantity + ", ";
                    }
                  })}
                </p>
                <p className="order-item-name">
                  {order.address.name}
                </p>
                <div className="order-item-address">
                  <p>{order.address.apartmentNo + ", "+
                    order.address.street +
                      ", " +
                      order.address.area +
                      ", " +
                      order.address.city +
                      " - " +
                      order.address.landmark}
                  </p>
                </div>
                <p className="order-item-phone">{order.address.phone}</p>
              </div>
              <p>Items : {order.items.length}</p>
              <p>
                ₹{order.amount} <b className="">(Paid)</b>
              </p>
              <select
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
          )}
        </div>
      </div>
    </>
  );
}

export default Orders;
