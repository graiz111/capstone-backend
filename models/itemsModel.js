import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true },  
    description: { 
        type: String },           
    price: { 
        type: Number, 
        required: true }, 
    restaurant_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'RESTAURANT', 
        required: true }, 
    category: { 
        type: String },              
    image: { 
        type: String },                 
    ingredients: { 
        type: [String] },         
    isAvailable: { 
        type: Boolean, 
        default: true }, 
    rating: { 
        type: Number, 
        min: 0, 
        max: 5 }, 
    tags: { 
        type: [String] },                
    calories: { 
        type: Number },              
    preparation_time: { 
        type: Number },      
    created_at: { 
        type: Date, 
        default: Date.now }, 
    updated_at: { 
        type: Date, 
        default: Date.now }, 
  });

export const ITEMS = mongoose.model("ITEMS", itemsSchema);
