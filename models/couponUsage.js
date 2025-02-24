import mongoose from "mongoose";
const couponUsageSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    couponCode: {
      type: String, // Store only one coupon code per order
      ref: "COUPON",
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  // Ensure a user cannot use the same coupon more than once
  couponUsageSchema.index({ userId: 1, couponCode: 1 }, { unique: true });
  
  export const COUPON_USAGE = mongoose.model("COUPON_USAGE", couponUsageSchema);
  
