import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import restaurantModel from "./models/restaurant.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const seedRestaurants = async () => {
  try {
    // Connect to MongoDB
    const dbUrl = process.env.DB_URL || process.env.MONGODB_URI;
    if (!dbUrl) {
      throw new Error("DB_URL or MONGODB_URI not found in .env file");
    }
    
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");

    // Clear existing restaurants (optional - comment out if you don't want to clear)
    // await restaurantModel.deleteMany({});
    // console.log("🗑️  Cleared existing restaurants");

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("RESTAURANT2024", salt);

    // Sample restaurant data
    const sampleRestaurants = [
      {
        name: "FoodFast Kitchen - District 1",
        email: "district1@foodfast.com",
        password: hashedPassword,
        phoneNumber: "0901234567",
        address: "123 Nguyen Hue Street, Ben Nghe Ward",
        city: "Ho Chi Minh City",
        restaurantCode: "FFKD1",
        isActive: true,
      },
      {
        name: "FoodFast Kitchen - District 3",
        email: "district3@foodfast.com",
        password: hashedPassword,
        phoneNumber: "0902345678",
        address: "456 Vo Van Tan Street, Ward 5",
        city: "Ho Chi Minh City",
        restaurantCode: "FFKD3",
        isActive: true,
      },
      {
        name: "FoodFast Kitchen - Binh Thanh",
        email: "binhthanh@foodfast.com",
        password: hashedPassword,
        phoneNumber: "0903456789",
        address: "789 Xo Viet Nghe Tinh Street, Ward 25",
        city: "Ho Chi Minh City",
        restaurantCode: "FFKBT",
        isActive: true,
      },
    ];

    // Insert restaurants
    const restaurants = await restaurantModel.insertMany(sampleRestaurants);
    console.log(`✅ Inserted ${restaurants.length} restaurants successfully!`);

    // Display login credentials
    console.log("\n📋 Sample Restaurant Login Credentials:");
    console.log("==========================================");
    sampleRestaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. ${restaurant.name}`);
      console.log(`   Email: ${restaurant.email}`);
      console.log(`   Password: RESTAURANT2024`);
      console.log(`   Code: ${restaurant.restaurantCode}`);
    });
    console.log("\n==========================================");

    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding restaurants:", error);
    process.exit(1);
  }
};

seedRestaurants();
