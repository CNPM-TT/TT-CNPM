import orderModel from "../../database/models/order.model.js";
import userModel from "../../database/models/user.model.js";
import Stripe from "stripe";
import { CLIENT_DOMAIN } from "../config/client.js";
import {
  sendOrderConfirmNotif,
  sendOrderStatusNotif,
} from "../middleware/nodemailer.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    // Extract unique restaurantIds from order items
    const restaurantIds = [...new Set(
      req.body.items
        .map(item => item.restaurantId)
        .filter(id => id) // Remove undefined/null
    )];

    // Initialize restaurantStatus for each restaurant
    const restaurantStatus = new Map();
    restaurantIds.forEach(id => {
      restaurantStatus.set(id.toString(), "Food Processing");
    });

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      cod: false,
      restaurantIds: restaurantIds,
      restaurantStatus: restaurantStatus,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const mock_checkout_url = `${CLIENT_DOMAIN}/checkout?orderId=${newOrder._id}&amount=${req.body.amount}`;

    return res.json({
      success: true,
      session_url: mock_checkout_url,
      message: "Your order has been placed.",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error placing order. Please try again later." });
  }
};
const cod = async (req, res) => {
  try {
    // Extract unique restaurantIds from order items
    const restaurantIds = [...new Set(
      req.body.items
        .map(item => item.restaurantId)
        .filter(id => id) // Remove undefined/null
    )];

    // Initialize restaurantStatus for each restaurant
    const restaurantStatus = new Map();
    restaurantIds.forEach(id => {
      restaurantStatus.set(id.toString(), "Food Processing");
    });

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      cod: true,
      restaurantIds: restaurantIds,
      restaurantStatus: restaurantStatus,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const success_url = `${CLIENT_DOMAIN}/verify?success=ok&orderId=${newOrder._id}`;
    return res.json({
      success: true,
      session_url: success_url,
      message: `Your order has been placed. Pay ₹${req.body.amount} via cash or online.`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error placing order. Please try again later." });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      const orderDetails = await orderModel.findById(orderId);
      
      // Update totalOrders count for each restaurant in the order
      if (orderDetails.restaurantIds && orderDetails.restaurantIds.length > 0) {
        const restaurantModel = (await import("../../database/models/restaurant.model.js")).default;
        
        for (const restaurantId of orderDetails.restaurantIds) {
          await restaurantModel.findByIdAndUpdate(
            restaurantId,
            { $inc: { totalOrders: 1 } }
          );
        }
      }
      
      // Send email (non-blocking)
      sendOrderConfirmNotif(
        orderDetails.address.email,
        orderDetails.address.name,
        orderDetails.address.street,
        orderDetails.address.phone,
        orderDetails.amount,
        false
      ).catch((emailError) => {
        console.log("Failed to send order confirmation email:", emailError.message);
      });
      
      res.json({ success: true, message: "Order Placed." });
    } else if (success === "ok") {
      await orderModel.findByIdAndUpdate(orderId, { payment: false });
      const orderDetails = await orderModel.findById(orderId);
      
      // Send email (non-blocking)
      sendOrderConfirmNotif(
        orderDetails.address.email,
        orderDetails.address.name,
        orderDetails.address.street,
        orderDetails.address.phone,
        orderDetails.amount,
        true
      ).catch((emailError) => {
        console.log("Failed to send order confirmation email:", emailError.message);
      });
      
      res.json({ success: true, message: "Order Placed via COD." });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed." });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Payment failed. Try again later." });
  }
};

//order list after confirmation
const userOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({
      userId: req.body.userId,
      payment: true, // Only paid orders (online payment)
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Order Fetching failed." });
  }
};

//admin panel order list
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      payment: true, // Only paid orders (online payment)
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Order Fetching failed." });
  }
};

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    // Auto-delivery for drone orders: When restaurant dispatches drone, mark as delivered immediately
    let finalStatus = req.body.status;
    if (req.body.status === "Out for Delivery") {
      finalStatus = "Delivered"; // Drone delivery is instant
    }

    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: finalStatus,
    });
    
    const orderDetails = await orderModel.findById(req.body.orderId);
    
    // Send email (non-blocking)
    sendOrderStatusNotif(
      orderDetails.address.email,
      orderDetails.address.name,
      orderDetails.address.street,
      orderDetails.address.phone,
      orderDetails.amount,
      orderDetails.cod,
      finalStatus
    ).catch((emailError) => {
      console.log("Failed to send order status email:", emailError.message);
    });
    
    res.json({ success: true, message: "Order status updated." });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to update order. Try again later.",
    });
  }
};

// Get orders for specific restaurant (restaurant panel)
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurantId; // From authRestaurant middleware
    
    // Find all orders that contain items from this restaurant
    const orders = await orderModel.find({
      restaurantIds: restaurantId,
      $or: [{ payment: true }, { cod: true }], // Include both paid and COD orders
    }).sort({ date: -1 });

    res.json({ 
      success: true, 
      data: orders,
      message: "Restaurant orders fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching restaurant orders." });
  }
};

// Update order status for specific restaurant
const updateRestaurantOrderStatus = async (req, res) => {
  try {
    const restaurantId = req.restaurantId; // From authRestaurant middleware
    const { orderId, status } = req.body;

    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found." });
    }

    // Verify this restaurant is part of the order
    if (!order.restaurantIds.includes(restaurantId)) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this order." 
      });
    }

    // Update status for this specific restaurant
    if (!order.restaurantStatus) {
      order.restaurantStatus = new Map();
    }
    order.restaurantStatus.set(restaurantId.toString(), status);

    // If all restaurants are done, update main order status
    const allStatuses = Array.from(order.restaurantStatus.values());
    if (allStatuses.every(s => s === "Delivered" || s === "Out for Delivery")) {
      order.status = "Delivered";
    } else if (allStatuses.some(s => s === "Out for Delivery")) {
      order.status = "Out for Delivery";
    } else if (allStatuses.some(s => s === "Ready for Pickup")) {
      order.status = "Ready for Pickup";
    } else if (allStatuses.some(s => s === "Preparing")) {
      order.status = "Preparing";
    }

    await order.save();
    
    // Send email notification if fully delivered
    if (order.status === "Delivered") {
      sendOrderStatusNotif(
        order.address.email,
        order.address.name,
        order.address.street,
        order.address.phone,
        order.amount,
        order.cod,
        "Delivered"
      ).catch((emailError) => {
        console.log("Failed to send order status email:", emailError.message);
      });
    }
    
    res.json({ success: true, message: "Order status updated." });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to update order. Try again later.",
    });
  }
};

export { placeOrder, cod, verifyOrder, userOrder, listOrders, updateStatus, getRestaurantOrders, updateRestaurantOrderStatus };
