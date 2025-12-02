import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import hubModel from "./models/hub.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedHubs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing hubs
    await hubModel.deleteMany({});
    console.log("✓ Cleared existing hubs");

    const hubs = [
      {
        hubCode: "HUB-D1",
        name: "District 1 Hub",
        location: {
          address: "123 Le Loi Street, District 1",
          district: "District 1",
          city: "Ho Chi Minh City",
          latitude: 10.7756,
          longitude: 106.7019
        },
        status: "active",
        capacity: {
          maxDrones: 25,
          maxOrders: 150
        },
        coverageArea: [
          { district: "District 1", maxDistance: 5 },
          { district: "District 3", maxDistance: 3 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      },
      {
        hubCode: "HUB-D2",
        name: "District 2 Hub",
        location: {
          address: "456 Thao Dien Street, District 2",
          district: "District 2",
          city: "Ho Chi Minh City",
          latitude: 10.7980,
          longitude: 106.7297
        },
        status: "active",
        capacity: {
          maxDrones: 20,
          maxOrders: 100
        },
        coverageArea: [
          { district: "District 2", maxDistance: 5 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      },
      {
        hubCode: "HUB-D3",
        name: "District 3 Hub",
        location: {
          address: "789 Vo Van Tan Street, District 3",
          district: "District 3",
          city: "Ho Chi Minh City",
          latitude: 10.7830,
          longitude: 106.6880
        },
        status: "active",
        capacity: {
          maxDrones: 18,
          maxOrders: 120
        },
        coverageArea: [
          { district: "District 3", maxDistance: 5 },
          { district: "District 10", maxDistance: 3 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      },
      {
        hubCode: "HUB-D7",
        name: "District 7 Hub",
        location: {
          address: "101 Nguyen Huu Tho Street, District 7",
          district: "District 7",
          city: "Ho Chi Minh City",
          latitude: 10.7350,
          longitude: 106.7220
        },
        status: "active",
        capacity: {
          maxDrones: 22,
          maxOrders: 130
        },
        coverageArea: [
          { district: "District 7", maxDistance: 5 },
          { district: "District 4", maxDistance: 3 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      },
      {
        hubCode: "HUB-BT",
        name: "Binh Thanh Hub",
        location: {
          address: "202 Dien Bien Phu Street, Binh Thanh",
          district: "Binh Thanh",
          city: "Ho Chi Minh City",
          latitude: 10.8040,
          longitude: 106.7040
        },
        status: "active",
        capacity: {
          maxDrones: 20,
          maxOrders: 110
        },
        coverageArea: [
          { district: "Binh Thanh", maxDistance: 5 },
          { district: "Phu Nhuan", maxDistance: 3 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      },
      {
        hubCode: "HUB-TB",
        name: "Tan Binh Hub",
        location: {
          address: "303 Truong Chinh Street, Tan Binh",
          district: "Tan Binh",
          city: "Ho Chi Minh City",
          latitude: 10.8000,
          longitude: 106.6530
        },
        status: "active",
        capacity: {
          maxDrones: 25,
          maxOrders: 140
        },
        coverageArea: [
          { district: "Tan Binh", maxDistance: 5 }
        ],
        operatingHours: {
          open: "06:00",
          close: "23:00"
        }
      }
    ];

    // Insert hubs
    await hubModel.insertMany(hubs);
    console.log(`\n✅ Successfully seeded ${hubs.length} hubs`);

    // Display summary
    const activeHubs = hubs.filter(h => h.status === 'active').length;
    console.log(`\nHub Summary:`);
    console.log(`- Total Hubs: ${hubs.length}`);
    console.log(`- Active: ${activeHubs}`);
    console.log(`- Districts covered: ${[...new Set(hubs.map(h => h.location.district))].join(', ')}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding hubs:", error);
    process.exit(1);
  }
};

seedHubs();
