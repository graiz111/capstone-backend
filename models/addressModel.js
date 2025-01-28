import  mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'USER', 
    required: true },
  address_line_1: { 
    type: String, 
    required: true },
  address_line_2: { 
    type: String },
  city: { 
    type: String, 
    required: true },
  state: { 
    type: String, 
    required: true },
  country: { 
    type: String, 
    default: 'India' },
  postal_code: { 
    type: String, 
    required: true },
  phone: { 
    type: String, 
    required: true },
});

export const ADDRESS = mongoose.model('ADDRESS', addressSchema);


