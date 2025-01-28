import { sendOTP } from "../utils/otpMail.js";
import { OTP } from "../models/otpModel.js";
import { generateToken } from "../utils/token.js";
import { createCookie } from "../utils/cookie.js";
import bcrypt from 'bcrypt'
import { USER } from "../models/userModel.js";
import { RESTAURANT} from "../models/restaurantModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import {ADMIN} from '../models/adminModel.js'


export const sendOtp = async (email,role) => {
 


  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

    const otpRecord = new OTP({
      email,
      role,
      otp,
    });
    await otpRecord.save();

    await sendOTP(email, role, otp);

    
  } catch (error) {
    console.error("Error sending OTP: ", error);
   ;
  }
};
export const verifyOtp = async (req, res) => {
  const { email, otp, role } = req.body; 
  console.log(req.body);
  
  // Get email, OTP, and role from the front end

  if (!otp || !email || !role) {
    return res.status(400).json({ message: "Email, OTP, and role are required!" });
  }

  try {
    // Map role to the corresponding user model
    const userModelMap = {
      user: USER,
      restaurant: RESTAURANT,
      admin: ADMIN,
      delivery: DELIVERY,
    };

    if (!userModelMap[role]) {
      return res.status(400).json({ message: "Invalid role!" });
    }

    // Check if the user exists in the respective collection based on role
    const userData = await userModelMap[role].findOne({ email });
    if (!userData) {
      return res.status(404).json({ message: `No ${role} found with this email` });
    }

    // Verify OTP record
    const otpRecord = await OTP.findOne({ email, role, otp });
    if (!otpRecord) {
      // Delete user if OTP verification fails
      await userModelMap[role].deleteOne({ email });
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    // Delete OTP record after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate a token for the user
    const token = generateToken(userData._id, userData.role);
    createCookie(res, token);

    // Remove sensitive information like password before sending the response
    const { password, ...userDetails } = userData._doc;

    return res.status(200).json({
      message: `OTP verified successfully and ${role} created`,
      data: userDetails,
    });

  } catch (error) {
    console.error("Error verifying OTP and creating user:", error);
    res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
};



export const otpverifypassword=async(req,res)=>{
  const { email, role, otp } = req.body;
  console.log(req.body);
  

  if (!email || !role || !otp) {
    return res.status(400).json({ message: "email, role, and OTP are required!" });
  }

  try {
    const otpRecord = await OTP.find({ email, role, otp });
    console.log(otpRecord);
    

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully!",success:true });
    

  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
  

}



export const passwordreset = async (req, res) => {
  try {
    console.log("Password reset endpoint hit");

    const { password, passwordtwo } = req.body;
    const { id, role } = req.user; // Assuming req.user is populated by middleware

    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user);

    // Validate input
    if (!password || !passwordtwo) {
      return res.status(400).json({
        message: "Both passwords are required",
        success: false,
      });
    }

    if (password !== passwordtwo) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    // Define a mapping of roles to their respective models
    const roleModelMap = {
      user: USER,
      admin: ADMIN,
      restaurant: RESTAURANT,
      delivery: DELIVERY,
    };

    // Get the model based on the user's role
    const Model = roleModelMap[role];

    if (!Model) {
      return res.status(400).json({
        message: "Invalid role specified",
        success: false,
      });
    }

    // Find the user in the database
    const userToEdit = await Model.findById(id);

    if (!userToEdit) {
      return res.status(404).json({
        message: "User not found in the database",
        success: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    userToEdit.password = hashedPassword;
    await userToEdit.save();

    // Respond with success
    return res.status(200).json({
      message: `${role} password successfully changed`,
      success: true,
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};



