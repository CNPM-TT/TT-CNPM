import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    available:{
      type: Boolean,
      default: true
    },
    veg:{
      type:Boolean
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'restaurant',
      required: false, // Optional for backward compatibility with existing foods
    }
    
  },
  { timestamps: true }
);

// Add index for faster queries by restaurant
foodSchema.index({ restaurantId: 1 });


const foodModel = mongoose.model.food || mongoose.model("food", foodSchema)

export default foodModel;