import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import restaurantModel from "./models/restaurant.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const updateRestaurantDistricts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Sample districts in Ho Chi Minh City
    const districts = [
      "District 1", "District 2", "District 3", "District 4", "District 5",
      "District 7", "District 10", "Binh Thanh", "Phu Nhuan", "Tan Binh"
    ];

    // Get all restaurants
    const restaurants = await restaurantModel.find({});
    
    if (restaurants.length === 0) {
      console.log("⚠ No restaurants found in database");
      await mongoose.connection.close();
      return;
    }

    console.log(`\nUpdating districts for ${restaurants.length} restaurants...`);

    // Assign random districts to restaurants
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      const district = districts[i % districts.length];
      
      await restaurantModel.findByIdAndUpdate(restaurant._id, {
        district: district,
        city: 'Ho Chi Minh City'
      });
      
      console.log(`✓ Updated ${restaurant.name} → ${district}`);
    }

    console.log("\n✅ Successfully updated all restaurant districts");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error updating restaurant districts:", error);
    process.exit(1);
  }
};

updateRestaurantDistricts();
