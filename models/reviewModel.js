import  mongoose from "mongoose";



const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'USER', 
    required: true },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RESTAURANT', 
    required: true },
  rating:{ 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 },
  comment: { 
    type: String, 
    required: false },
  createdAt: { 
    type: Date, 
    default: Date.now },
});



export const REVIEW = mongoose.model('REVIEW', reviewSchema);
