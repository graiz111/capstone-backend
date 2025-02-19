import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "USER", required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "RESTAURANT", required: true },
  items: [
    {
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: "ITEMS", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Placed", "Preparing", "Out for Delivery", "Assigned to Delivery Boy", "Delivered"],
    default: "Placed",
  },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ["COD", "Online"], required: true },
  sessionId: { type: String },
  deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "DELIVERY" }, // Add this field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ORDER = mongoose.model("ORDER", orderSchema);
