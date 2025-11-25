import express from 'express';
import { 
  getAllRestaurants, 
  getRestaurantByEmail, 
  getRestaurantById,
  getRestaurantsList,
  loginRestaurant, 
  registerRestaurant, 
  updateRestaurantByEmail,
  updateRestaurantStatus
} from '../controllers/restaurant.controller.js';
import authMiddleware from '../middleware/auth.js';

const restaurantRouter = express.Router();

// Public routes
restaurantRouter.post("/register", registerRestaurant);
restaurantRouter.post("/login", loginRestaurant);
restaurantRouter.get("/list", getRestaurantsList); // For customer frontend
restaurantRouter.get("/:id", getRestaurantById); // For restaurant details

// Protected routes (admin only)
restaurantRouter.get("/", authMiddleware, getAllRestaurants);
restaurantRouter.post("/getByEmail", authMiddleware, getRestaurantByEmail);
restaurantRouter.post("/updateByEmail", authMiddleware, updateRestaurantByEmail);
restaurantRouter.post("/updateStatus", authMiddleware, updateRestaurantStatus);
restaurantRouter.post("/toggleStatus", updateRestaurantStatus); // For admin toggle

export default restaurantRouter;
