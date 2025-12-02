import mongoose from 'mongoose';
import droneModel from './models/drone.model.js';
import restaurantModel from './models/restaurant.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDrones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get some restaurants
    const restaurants = await restaurantModel.find().limit(3);
    
    const drones = [
      {
        droneCode: 'DRONE-001',
        status: 'available',
        currentLocation: {
          latitude: 10.8231,
          longitude: 106.6297,
          address: 'Warehouse District 1, HCMC',
          district: 'District 1'
        },
        battery: {
          level: 100,
          isCharging: false
        },
        capacity: {
          maxWeight: 5,
          maxItems: 10
        },
        assignedRestaurantId: restaurants[0]?._id || null,
        specifications: {
          model: 'DroneX-2000',
          speed: 65,
          range: 25
        }
      },
      {
        droneCode: 'DRONE-002',
        status: 'available',
        currentLocation: {
          latitude: 10.7769,
          longitude: 106.7009,
          address: 'Warehouse District 7, HCMC',
          district: 'District 7'
        },
        battery: {
          level: 85,
          isCharging: false
        },
        capacity: {
          maxWeight: 7,
          maxItems: 12
        },
        assignedRestaurantId: restaurants[1]?._id || null,
        specifications: {
          model: 'DroneX-3000',
          speed: 70,
          range: 30
        }
      },
      {
        droneCode: 'DRONE-003',
        status: 'charging',
        currentLocation: {
          latitude: 10.8050,
          longitude: 106.7153,
          address: 'Charging Station Tan Binh',
          district: 'Tan Binh'
        },
        battery: {
          level: 45,
          isCharging: true,
          chargingStartedAt: new Date(Date.now() - 15 * 60000), // Started 15 minutes ago
          estimatedFullChargeAt: new Date(Date.now() + 13 * 60000), // 13 more minutes (28 min total for 56%)
          chargingRate: 2
        },
        capacity: {
          maxWeight: 5,
          maxItems: 10
        },
        assignedRestaurantId: restaurants[0]?._id || null
      },
      {
        droneCode: 'DRONE-004',
        status: 'available',
        currentLocation: {
          latitude: 10.7625,
          longitude: 106.6825,
          address: 'Hub District 3',
          district: 'District 3'
        },
        battery: {
          level: 92,
          isCharging: false
        },
        capacity: {
          maxWeight: 10,
          maxItems: 15
        },
        assignedRestaurantId: restaurants[2]?._id || null,
        specifications: {
          model: 'DroneX-5000',
          speed: 80,
          range: 35
        }
      },
      {
        droneCode: 'DRONE-005',
        status: 'maintenance',
        currentLocation: {
          latitude: 10.7889,
          longitude: 106.6959,
          address: 'Maintenance Center',
          district: 'District 10'
        },
        battery: {
          level: 0,
          isCharging: false
        },
        capacity: {
          maxWeight: 5,
          maxItems: 10
        },
        assignedRestaurantId: null
      },
      {
        droneCode: 'DRONE-006',
        status: 'available',
        currentLocation: {
          latitude: 10.8142,
          longitude: 106.6438,
          address: 'Hub Tan Phu',
          district: 'Tan Phu'
        },
        battery: {
          level: 100,
          isCharging: false
        },
        capacity: {
          maxWeight: 8,
          maxItems: 12
        },
        assignedRestaurantId: restaurants[1]?._id || null,
        specifications: {
          model: 'DroneX-2500',
          speed: 68,
          range: 28
        }
      }
    ];

    // Clear existing drones
    await droneModel.deleteMany({});
    console.log('Cleared existing drones');

    // Insert new drones
    const result = await droneModel.insertMany(drones);
    console.log(`✅ Successfully seeded ${result.length} drones`);

    // Display summary
    console.log('\n📊 Drone Summary:');
    console.log(`Available: ${drones.filter(d => d.status === 'available').length}`);
    console.log(`Charging: ${drones.filter(d => d.status === 'charging').length}`);
    console.log(`Maintenance: ${drones.filter(d => d.status === 'maintenance').length}`);
    console.log(`Busy: ${drones.filter(d => d.status === 'busy').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding drones:', error);
    process.exit(1);
  }
};

seedDrones();
