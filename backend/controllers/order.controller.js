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
    // Compute amount server-side from posted items to avoid trusting client calculation
    const items = req.body.items || [];
    const computedAmount = items.reduce((acc, it) => {
      const price = typeof it.price === 'number' ? it.price : 0;
      const qty = typeof it.quantity === 'number' ? it.quantity : 0;
      return acc + price * qty;
    }, 0);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: computedAmount,
      address: req.body.address,
      cod: false,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

  // Use mock checkout page (demo payment form) — use server-computed amount
  const mock_checkout_url = `${CLIENT_DOMAIN}/checkout?orderId=${newOrder._id}&amount=${computedAmount}`;
    
    return res.json({
      success: true,
      session_url: mock_checkout_url,
      message: "Your order has been placed.",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error placing order. Please try again later.",
    });
  }
};
const cod = async (req, res) => {
  try {
    const items = req.body.items || [];
    const computedAmount = items.reduce((acc, it) => {
      const price = typeof it.price === 'number' ? it.price : 0;
      const qty = typeof it.quantity === 'number' ? it.quantity : 0;
      return acc + price * qty;
    }, 0);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: computedAmount,
      address: req.body.address,
      cod: true,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const success_url = `${CLIENT_DOMAIN}/verify?success=ok&orderId=${newOrder._id}`;
    return res.json({
      success: true,
      session_url: success_url,
      message: `Your order has been placed. Pay ₹${computedAmount} via cash or online.`,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error placing order. Please try again later.",
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      const orderDetails = await orderModel.findById(orderId);
      sendOrderConfirmNotif(
        orderDetails.address.email,
        orderDetails.address.name,
        orderDetails.address.street,
        orderDetails.address.phone,
        orderDetails.amount,
        false
      );
      res.json({ success: true, message: "Order Placed." });
    } else if (success === "ok") {
      await orderModel.findByIdAndUpdate(orderId, { payment: false });
      const orderDetails = await orderModel.findById(orderId);
      sendOrderConfirmNotif(
        orderDetails.address.email,
        orderDetails.address.name,
        orderDetails.address.street,
        orderDetails.address.phone,
        orderDetails.amount,
        true
      );
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
    sendOrderStatusNotif(
      orderDetails.address.email,
      orderDetails.address.name,
      orderDetails.address.street,
      orderDetails.address.phone,
      orderDetails.amount,
      orderDetails.cod,
      finalStatus
    );
    res.json({ success: true, message: "Order status updated." });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to update order. Try again later.",
    });
  }
};
export { placeOrder, cod, verifyOrder, userOrder, listOrders, updateStatus };
