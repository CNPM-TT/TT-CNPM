import express from "express";
import { 
  listDrones, 
  addDrone, 
  updateDrone, 
  removeDrone, 
  getRestaurantDrones, 
  getAvailableDrones,
  updateDroneStatus
} from "../controllers/drone.controller.js";
import authRestaurant from "../middleware/authRestaurant.js";

const droneRouter = express.Router();

// Admin routes (no auth for now, should add admin middleware later)
droneRouter.get("/list", listDrones);
droneRouter.post("/add", addDrone);
droneRouter.put("/update/:id", updateDrone);
droneRouter.delete("/remove/:id", removeDrone);
droneRouter.put("/status/:id", updateDroneStatus);
droneRouter.get("/available", getAvailableDrones);

// Restaurant routes
droneRouter.get("/restaurant/my-drones", authRestaurant, getRestaurantDrones);

export default droneRouter;
