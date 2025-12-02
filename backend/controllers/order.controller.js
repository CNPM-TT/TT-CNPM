import orderModel from "../../database/models/order.model.js";
import userModel from "../../database/models/user.model.js";
import restaurantModel from "../../database/models/restaurant.model.js";
import hubModel from "../../database/models/hub.model.js";
import droneModel from "../../database/models/drone.model.js";
import Stripe from "stripe";
import { CLIENT_DOMAIN } from "../config/client.js";
import {
  sendOrderConfirmNotif,
  sendOrderStatusNotif,
} from "../middleware/nodemailer.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to split orders by district
const splitOrderByDistrict = async (restaurantIds, itemsByRestaurant, amountByRestaurant) => {
  try {
    // Fetch restaurant details with districts
    const restaurants = await restaurantModel.find({
      _id: { $in: restaurantIds }
    }).select('_id district');

    // Group restaurants by district
    const districtGroups = {};
    restaurants.forEach(restaurant => {
      const district = restaurant.district || 'Unknown';
      if (!districtGroups[district]) {
        districtGroups[district] = [];
      }
      districtGroups[district].push(restaurant._id.toString());
    });

    // Create delivery zones
    const deliveryZones = [];
    for (const [district, restIds] of Object.entries(districtGroups)) {
      // Find nearest hub for this district
      const hub = await hubModel.findOne({
        'location.district': district,
        status: 'active'
      }).sort({ 'assignedDrones.length': 1 }); // Prefer hubs with fewer drones

      // Collect items and calculate amount for this zone
      const zoneItems = [];
      let zoneAmount = 0;
      
      restIds.forEach(restId => {
        if (itemsByRestaurant[restId]) {
          zoneItems.push(...itemsByRestaurant[restId]);
          zoneAmount += (amountByRestaurant.get(restId) || 0);
        }
      });

      deliveryZones.push({
        district,
        restaurantIds: restIds,
        items: zoneItems,
        amount: zoneAmount,
        hubId: hub ? hub._id : null
      });
    }

    return deliveryZones;
  } catch (error) {
    console.error('Error splitting order by district:', error);
    return [];
  }
};

// Helper function to calculate optimal drone count
const calculateOptimalDrones = (deliveryZones) => {
  return deliveryZones.map(zone => {
    const totalItems = zone.items.length;
    const totalWeight = zone.items.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // Assume 0.5kg per item
    
    // Calculate drones needed based on capacity (max 5kg or 10 items per drone)
    const dronesForWeight = Math.ceil(totalWeight / 5);
    const dronesForItems = Math.ceil(totalItems / 10);
    const dronesNeeded = Math.max(dronesForWeight, dronesForItems, 1);
    
    return {
      ...zone,
      recommendedDrones: dronesNeeded,
      estimatedWeight: totalWeight
    };
  });
};

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
    const amountByRestaurant = new Map();
    const itemsByRestaurant = {};
    
    restaurantIds.forEach(id => {
      restaurantStatus.set(id.toString(), "Food Processing");
      amountByRestaurant.set(id.toString(), 0);
      itemsByRestaurant[id.toString()] = [];
    });

    // Calculate amount per restaurant and group items
    req.body.items.forEach(item => {
      if (item.restaurantId) {
        const restId = item.restaurantId.toString();
        const itemTotal = item.price * item.quantity;
        
        // Add to restaurant's total
        const currentAmount = amountByRestaurant.get(restId) || 0;
        amountByRestaurant.set(restId, currentAmount + itemTotal);
        
        // Group items by restaurant
        itemsByRestaurant[restId].push(item);
      }
    });

    // Split order by district and assign hubs
    const deliveryZones = await splitOrderByDistrict(restaurantIds, itemsByRestaurant, amountByRestaurant);
    const optimizedZones = calculateOptimalDrones(deliveryZones);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      cod: false,
      restaurantIds: restaurantIds,
      restaurantStatus: restaurantStatus,
      amountByRestaurant: amountByRestaurant,
      itemsByRestaurant: itemsByRestaurant,
      deliveryZones: optimizedZones,
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

    // Initialize restaurantStatus and calculate amounts per restaurant
    const restaurantStatus = new Map();
    const amountByRestaurant = new Map();
    const itemsByRestaurant = {};
    
    restaurantIds.forEach(id => {
      restaurantStatus.set(id.toString(), "Food Processing");
      amountByRestaurant.set(id.toString(), 0);
      itemsByRestaurant[id.toString()] = [];
    });

    // Calculate amount per restaurant
    req.body.items.forEach(item => {
      if (item.restaurantId) {
        const restId = item.restaurantId.toString();
        const itemTotal = item.price * item.quantity;
        
        const currentAmount = amountByRestaurant.get(restId) || 0;
        amountByRestaurant.set(restId, currentAmount + itemTotal);
        
        itemsByRestaurant[restId].push(item);
      }
    });

    // Split order by district and assign hubs
    const deliveryZones = await splitOrderByDistrict(restaurantIds, itemsByRestaurant, amountByRestaurant);
    const optimizedZones = calculateOptimalDrones(deliveryZones);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      cod: true,
      restaurantIds: restaurantIds,
      restaurantStatus: restaurantStatus,
      amountByRestaurant: amountByRestaurant,
      itemsByRestaurant: itemsByRestaurant,
      deliveryZones: optimizedZones,
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
    // Support both new orders (with restaurantIds) and old orders (check items.restaurantId)
    const orders = await orderModel.find({
      $and: [
        {
          $or: [
            { restaurantIds: restaurantId }, // New orders with restaurantIds array
            { 'items.restaurantId': restaurantId } // Old orders - check items
          ]
        },
        {
          $or: [{ payment: true }, { cod: true }] // Include both paid and COD orders
        }
      ]
    }).sort({ date: -1 });

    res.json({
      success: true, 
      data: orders,
      message: "Restaurant orders fetched successfully." 
    });
  } catch (error) {
    console.log('❌ Error fetching restaurant orders:', error);
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

// Get order details with delivery zones (for debugging and order tracking)
const getOrderDeliveryZones = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId)
      .populate('restaurantIds', 'name district')
      .populate('deliveryZones.hubId', 'hubCode name location');
    
    if (!order) {
      return res.json({ success: false, message: "Order not found." });
    }

    // Calculate summary
    const summary = {
      totalZones: order.deliveryZones ? order.deliveryZones.length : 0,
      districts: order.deliveryZones ? [...new Set(order.deliveryZones.map(z => z.district))] : [],
      totalRecommendedDrones: order.deliveryZones ? order.deliveryZones.reduce((sum, z) => sum + (z.recommendedDrones || 0), 0) : 0,
      sameDistrict: order.deliveryZones && order.deliveryZones.length === 1
    };

    res.json({
      success: true,
      data: {
        orderId: order._id,
        deliveryZones: order.deliveryZones,
        summary,
        restaurants: order.restaurantIds
      }
    });
  } catch (error) {
    console.error('Error fetching order delivery zones:', error);
    res.json({ success: false, message: "Error fetching delivery zones." });
  }
};

export { placeOrder, cod, verifyOrder, userOrder, listOrders, updateStatus, getRestaurantOrders, updateRestaurantOrderStatus, getOrderDeliveryZones };
