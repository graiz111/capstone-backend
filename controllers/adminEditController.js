import { USER } from "../models/userModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import { RESTAURANT } from "../models/restaurantModel.js";
import bcrypt from "bcryptjs";


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
  const { name, email, phone, password, role, isActive } = req.body;
  const MIN_PASSWORD_LENGTH = 6;

  try {
    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Trim inputs to avoid whitespace errors
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    // Validate password length
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    const Model = getModelByRole(role); // Get the model dynamically

    // Check if the user already exists
    const userExist = await Model.findOne({ email: trimmedEmail });
    if (userExist) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Create new user
    const newUser = new Model({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      role,
      password: hashedPassword, // Store hashed password
      isActive,
    });

    await newUser.save(); // Save to database

    res.status(201).json({ success: true, message: "User created successfully", data: newUser });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ success: false, message: "Failed to add user" });
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