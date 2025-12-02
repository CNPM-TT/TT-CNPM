import mongoose from "mongoose";

const droneSchema = new mongoose.Schema({
  droneCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  status: { 
    type: String, 
    enum: ['available', 'delivering', 'charging', 'maintenance', 'offline'],
    default: 'available'
  },
  currentLocation: {
    type: {
      latitude: Number,
      longitude: Number,
      address: String,
      district: String
    },
    default: null
  },
  capacity: {
    maxWeight: { type: Number, default: 5 }, // kg
    maxItems: { type: Number, default: 10 }
  },
  assignedRestaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "restaurant",
    default: null
  },
  assignedHubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hub",
    default: null
  },
  currentOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "order",
    default: null
  },
  battery: {
    level: { type: Number, default: 100, min: 0, max: 100 }, // percentage
    isCharging: { type: Boolean, default: false },
    chargingStartedAt: { type: Date, default: null },
    estimatedFullChargeAt: { type: Date, default: null },
    chargingRate: { type: Number, default: 2 } // percent per minute (100% in ~50 minutes)
  },
  specifications: {
    model: { type: String, default: 'DroneX-1000' },
    speed: { type: Number, default: 60 }, // km/h
    range: { type: Number, default: 20 } // km
  },
  deliveryHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    completedAt: { type: Date },
    distance: { type: Number }, // km
    duration: { type: Number } // minutes
  }],
  lastMaintenanceDate: { 
    type: Date, 
    default: Date.now 
  },
  totalDeliveries: { 
    type: Number, 
    default: 0 
  },
  totalDistance: { 
    type: Number, 
    default: 0 
  } // km
}, { 
  timestamps: true,
  minimize: false 
});

// Index for faster queries
droneSchema.index({ status: 1, assignedRestaurantId: 1 });
droneSchema.index({ assignedHubId: 1, status: 1 });

const droneModel = mongoose.models.drone || mongoose.model("drone", droneSchema);

export default droneModel;
