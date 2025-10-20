import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
        name: { type: String },
        price: { type: Number },
        image: { type: String },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
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
    
  },
  { timestamps: true }
);

const orderModel = mongoose.model.order || mongoose.model("order", orderSchema);
export default orderModel;
