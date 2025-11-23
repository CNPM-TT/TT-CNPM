import express from "express";
import {
  addFood,
  addFoodByRestaurant,
  getFoodById,
  getFoods,
  getFoodsByRestaurant,
  getMyFoods,
  removeFood,
  updateFoodStatus,
} from "../controllers/food.controller.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../middleware/cloudinary.config.js";
import authRestaurant from "../middleware/authRestaurant.js";

const foodRouter = express.Router();

//image storage engine

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tomato", 
    format: async (req, file) => "png", 
    public_id: (req, file) => Date.now().toString() + "-" + file.originalname,
  },
});

const upload = multer({ storage: storage });

// Admin routes (no restaurant auth needed)
foodRouter.post("/add", upload.single("image"), addFood);

// Restaurant routes (requires restaurant auth)
foodRouter.post("/restaurant/add", authRestaurant, upload.single("image"), addFoodByRestaurant);
foodRouter.get("/restaurant/my-foods", authRestaurant, getMyFoods);
foodRouter.patch("/restaurant/update/:id", authRestaurant, updateFoodStatus);
foodRouter.post("/restaurant/remove", authRestaurant, removeFood);

// Public routes
foodRouter.get("/getFoodById/:id", getFoodById);
foodRouter.get("/list", getFoods);
foodRouter.get("/restaurant/:restaurantId", getFoodsByRestaurant);

// Legacy admin routes
foodRouter.patch("/update/available/:id", updateFoodStatus);
foodRouter.post("/remove", removeFood);

export default foodRouter;
