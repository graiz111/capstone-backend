import mongoose from 'mongoose';


const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'USER', 
    required: true 
  },
  restaurant_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RESTAURANT', 
    
  },
  items: [
    {
      item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ITEMS', 
        
      },
      quantity: { 
        type: Number, 
        required: true, 
        default: 1 
      },
    },
  ],
  totalPrice: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export const CART = mongoose.model('CART', cartSchema);
