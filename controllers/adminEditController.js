import { USER } from "../models/userModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import { RESTAURANT } from "../models/restaurantModel.js";


const getModelByRole = (role) => {
  switch (role) {
    case 'user':
      return USER;
    case 'restaurant':
      return RESTAURANT;
    case 'delivery':
      return DELIVERY;
    default:
      throw new Error('Invalid role');
  }
};

export const addUser = async (req, res) => {
    const { name, email, phone,password, role, isActive } = req.body;
  
    try {
      const Model = getModelByRole(role); // Get the model dynamically
      const newUser = new Model({ name, email, phone, role,password, isActive });
      await newUser.save(); // Save the new user
      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      console.error('Error adding user:', err);
      res.status(500).json({ success: false, message: 'Failed to add user' });
    }
  };

 export  const editUser = async (req, res) => {
    const { _id, name, email, phone, role, isActive } = req.body;
  
    try {
      const Model = getModelByRole(role); // Get the model dynamically
      const updatedUser = await Model.findByIdAndUpdate(
        _id,
        { name, email, phone, role, isActive },
        { new: true } // Return the updated user
      );
      res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  };
 export  const deleteUser = async (req, res) => {
    const { _id, role } = req.body;
  
    try {
      const Model = getModelByRole(role); // Get the model dynamically
      await Model.findByIdAndDelete(_id); // Delete the user
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  };
 export  const toggleUserStatus = async (req, res) => {
    const { _id, isActive, role } = req.body;
  
    try {
      const Model = getModelByRole(role); // Get the model dynamically
      const updatedUser = await Model.findByIdAndUpdate(
        _id,
        { isActive: !isActive }, // Toggle the status
        { new: true } // Return the updated user
      );
      res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
      console.error('Error toggling user status:', err);
      res.status(500).json({ success: false, message: 'Failed to toggle user status' });
    }
  };