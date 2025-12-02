import mongoose from "mongoose";

const hubSchema = new mongoose.Schema({
  hubCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  location: {
    address: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, default: 'Ho Chi Minh City' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  capacity: {
    maxDrones: { type: Number, default: 20 },
    maxOrders: { type: Number, default: 100 }
  },
  assignedDrones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "drone"
  }],
  pendingOrders: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    restaurantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "restaurant" }],
    status: { 
      type: String, 
      enum: ['waiting', 'ready_for_dispatch', 'dispatched'],
      default: 'waiting'
    },
    arrivedAt: { type: Date },
    dispatchedAt: { type: Date }
  }],
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '23:00' }
  },
  coverageArea: [{
    district: String,
    maxDistance: { type: Number, default: 5 } // km
  }],
  statistics: {
    totalOrdersProcessed: { type: Number, default: 0 },
    currentActiveOrders: { type: Number, default: 0 },
    averageProcessingTime: { type: Number, default: 0 } // minutes
  }
}, { 
  timestamps: true,
  minimize: false 
});

// Index for location-based queries
hubSchema.index({ 'location.district': 1, status: 1 });
hubSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

const hubModel = mongoose.models.hub || mongoose.model("hub", hubSchema);

export default hubModel;
