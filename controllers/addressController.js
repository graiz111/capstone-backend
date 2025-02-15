import { ADDRESS } from '../models/addressModel.js';
import { USER } from "../models/userModel.js";
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// Main controller function for handling addresses
export const handleUserAddresses = async (req, res) => {
  try {
    const { action, user_id, address_id, ...addressData } = req.body;
    
    // Validate user_id when required
    if ((action === 'add' || !address_id) && !user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Validate address_id when required
    if ((action === 'edit' || action === 'delete' || !action) && address_id && !mongoose.isValidObjectId(address_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid address ID' 
      });
    }
    
    if (user_id && !mongoose.isValidObjectId(user_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    // Get all addresses for a user
    if (!action && user_id) {
      const addresses = await ADDRESS.find({ user_id: new ObjectId(user_id) }).sort({ created_at: -1 });
      return res.json({ 
        success: true, 
        addresses 
      });
    }
    
    // Get a specific address
    if (!action && address_id) {
      const address = await ADDRESS.findById(address_id);
      if (!address) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }
      return res.json({ 
        success: true, 
        address 
      });
    }
    
    // Add a new address
    if (action === 'add') {
      // Check if user exists
      const userExists = await USER.findById(user_id);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Sanitize data
      const sanitizedData = {
        user_id: new ObjectId(user_id),
        address_line_1: addressData.address_line_1,
        address_line_2: addressData.address_line_2 || '',
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        phone: addressData.phone,
        country: addressData.country || 'India'
      };
      
      // Check if this is the first address for the user (make it default)
      const addressCount = await ADDRESS.countDocuments({ user_id: new ObjectId(user_id) });
      if (addressCount === 0) {
        sanitizedData.is_default = true;
      }
      
      const newAddress = new ADDRESS(sanitizedData);
      await newAddress.save();
      
      return res.json({ 
        success: true, 
        message: 'Address added successfully',
        address: newAddress
      });
    }
    
    // Edit an existing address
    if (action === 'edit') {
      const updatedData = {
        ...addressData,
        updated_at: Date.now()
      };
      
      const updatedAddress = await ADDRESS.findByIdAndUpdate(
        address_id,
        { $set: updatedData },
        { new: true, runValidators: true }
      );
      
      if (!updatedAddress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }
      
      return res.json({ 
        success: true, 
        message: 'Address updated successfully',
        address: updatedAddress
      });
    }
    
    // Delete an address
    if (action === 'delete') {
      const addressToDelete = await ADDRESS.findById(address_id);
      
      if (!addressToDelete) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }
      
      await ADDRESS.deleteOne({ _id: address_id });
      
      // If this was the default address, set another one as default if available
      if (addressToDelete.is_default) {
        const anotherAddress = await ADDRESS.findOne({ user_id: addressToDelete.user_id });
        if (anotherAddress) {
          await ADDRESS.findByIdAndUpdate(
            anotherAddress._id,
            { $set: { is_default: true } }
          );
        }
      }
      
      return res.json({ 
        success: true, 
        message: 'Address deleted successfully' 
      });
    }
    
    // Set an address as default
    if (action === 'set_default') {
      // First, unset any existing default address
      await ADDRESS.updateMany(
        { user_id: user_id },
        { $set: { is_default: false } }
      );
      
      // Then set the new default
      const updatedAddress = await ADDRESS.findByIdAndUpdate(
        address_id,
        { $set: { is_default: true } },
        { new: true }
      );
      
      if (!updatedAddress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }
      
      return res.json({ 
        success: true, 
        message: 'Default address updated successfully',
        address: updatedAddress
      });
    }
    
    // If no valid action specified
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid action specified' 
    });
    
  } catch (error) {
    console.error('Error handling user addresses:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};