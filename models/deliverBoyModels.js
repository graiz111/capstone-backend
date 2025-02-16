import mongoose from 'mongoose';
const deliverySchema = mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      minlength: 10,
      required: true,
    },
    profilePic: {
      type: String,
      default: ''
    },
    isDelivery: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'restaurant'
    },
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ORDER'
    }]
  });
  
  export const DELIVERY = mongoose.model('DELIVERY', deliverySchema);