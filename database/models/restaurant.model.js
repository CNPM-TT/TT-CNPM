import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: Number,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    restaurantCode: {
      type: String,
      unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const restaurantModel = mongoose.model.restaurant || mongoose.model("restaurant", restaurantSchema);

export default restaurantModel;
