import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: {
      type: Array,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "Food Processing",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    payment: {
      type: Boolean,
      default: false,
    },
    cod: {
      type: Boolean,
      default: false,
    },
    // Track which restaurants are involved in this order
    restaurantIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'restaurant',
      default: [],
    },
    // Track status per restaurant (for multi-restaurant orders)
    restaurantStatus: {
      type: Map,
      of: String,
      default: new Map(),
    },
    // Amount breakdown by restaurant
    amountByRestaurant: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Items grouped by restaurant
    itemsByRestaurant: {
      type: Object,
      default: {},
    },
    // Drone delivery tracking
    assignedDrones: [{
      droneId: { type: mongoose.Schema.Types.ObjectId, ref: 'drone' },
      restaurantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' }],
      status: { 
        type: String, 
        enum: ['assigned', 'picked_up', 'in_transit', 'delivered'],
        default: 'assigned'
      },
      assignedAt: { type: Date, default: Date.now },
      deliveredAt: { type: Date }
    }],
    // Hub assignment (for consolidating orders from multiple restaurants)
    assignedHub: {
      hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'hub' },
      arrivedAt: { type: Date },
      status: {
        type: String,
        enum: ['pending', 'at_hub', 'consolidated', 'dispatched'],
        default: 'pending'
      }
    },
    // Delivery zones (for splitting orders by district)
    deliveryZones: [{
      district: String,
      restaurantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' }],
      items: Array,
      amount: Number,
      hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'hub' }
    }]
  },
  { timestamps: true }
);

const orderModel = mongoose.model.order || mongoose.model("order", orderSchema);
export default orderModel;