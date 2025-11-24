import express from 'express'
import authMidddleware from '../middleware/auth.js'
import authRestaurant from '../middleware/authRestaurant.js'
import { cod, listOrders, placeOrder, updateStatus, userOrder, verifyOrder, getRestaurantOrders, updateRestaurantOrderStatus } from '../controllers/order.controller.js'

const orderRouter = express.Router()

// Customer routes
orderRouter.post('/placeorder',authMidddleware, placeOrder)
// orderRouter.post('/cod',authMidddleware, cod) // COD disabled - only online payment
orderRouter.post('/verify', verifyOrder)
orderRouter.post('/userorder', authMidddleware,userOrder)

// Restaurant routes (requires restaurant authentication)
orderRouter.get('/restaurant/my-orders', authRestaurant, getRestaurantOrders)
orderRouter.post('/restaurant/update', authRestaurant, updateRestaurantOrderStatus)

// Admin routes
orderRouter.get('/list', listOrders)
orderRouter.post('/update', updateStatus)

export default orderRouter