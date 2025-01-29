import  mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true },
  discount: { 
    type: Number, 
    required: true }, 
  expiresAt: { 
    type: Date, 
    required: true },
  isActive: { 
    type: Boolean, 
    default: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ADMIN", 
    required: true }, 
});

 export const COUPON = mongoose.model("COUPON", couponSchema);
