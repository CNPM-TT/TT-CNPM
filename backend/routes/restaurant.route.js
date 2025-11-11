import express from 'express';
import { 
  getAllRestaurants, 
  getRestaurantByEmail, 
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

// Protected routes
restaurantRouter.get("/", authMiddleware, getAllRestaurants);
restaurantRouter.get("/list", authMiddleware, getAllRestaurants);
restaurantRouter.post("/getByEmail", authMiddleware, getRestaurantByEmail);
restaurantRouter.post("/updateByEmail", authMiddleware, updateRestaurantByEmail);
restaurantRouter.post("/updateStatus", authMiddleware, updateRestaurantStatus);

export default restaurantRouter;
