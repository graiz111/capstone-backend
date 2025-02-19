import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // Stores coupon codes in uppercase
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100, // Ensures the discount is between 1% and 100%
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, // Only active coupons can be applied
  },
});

export const COUPON = mongoose.model("COUPON", couponSchema);


