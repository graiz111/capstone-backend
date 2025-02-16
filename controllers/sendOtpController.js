
import { OTP } from "../models/otpModel.js";
import { generateToken } from "../utils/token.js";
import { createCookie } from "../utils/cookie.js";
import bcrypt from 'bcrypt'
import { USER } from "../models/userModel.js";
import { RESTAURANT} from "../models/restaurantModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import {ADMIN} from '../models/adminModel.js'



export const verifyOtp = async (req, res) => {
    const { email, otp, role, name, phone, password, profilePicUrl } = req.body;
    console.log("otpsignupverify server",req.body);
    

    if (!otp || !email || !role || !name || !phone || !password ) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const otpRecord = await OTP.findOne({ email, otp, role });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        const hashedPassword = bcrypt.hashSync(password, 10);

        const userModelMap = {
            user: USER,
            admin: ADMIN,
            restaurant: RESTAURANT,
            delivery: DELIVERY
        };

        if (!userModelMap[role]) {
            return res.status(400).json({ message: "Invalid role!" });
        }

        const UserModel = userModelMap[role];

        const isUserExist = await UserModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: `${role} already exists!` });
        }

        const newUser = new UserModel({
          name,
          email,
          password: hashedPassword,
          phone,
          role,
          ...(profilePicUrl && { profilePic: profilePicUrl }) 
      });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.role);
        createCookie(res, token);

        return res.status(200).json({
            message: `${role} created successfully`,
            data: { 
              _id: newUser._id, 
              name: newUser.name, 
              email: newUser.email,
              phone: newUser.phone ,
              profilePic:newUser.profilePic, 
              role 
            },
            success:true
        });


    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Failed to verify OTP", error: error.message });
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

    const { email, password,role } = req.body; // Only one password input
   

    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Map roles to their corresponding models
    const roleModelMap = {
      user: USER,
      admin: ADMIN,
      restaurant: RESTAURANT,
      delivery: DELIVERY,
    };

    const Model = roleModelMap[role];

    if (!Model) {
      return res.status(400).json({
        message: "Invalid role specified",
        success: false,
      });
    }

    // Find user by email
    const userToEdit = await Model.findOne({ email });

    if (!userToEdit) {
      return res.status(404).json({
        message: "User not found in the database",
        success: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    userToEdit.password = hashedPassword;
    await userToEdit.save();

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


export const verifyOtpLogin = async (req, res) => {
  const { email,otp,role,_id} = req.body; 
  console.log("rebody in verifyotplogin",req.body);

  if (!otp || !email||!_id) {
      return res.status(400).json({ message: "all fields are needed!" });
  }

  try {
      const otpRecord = await OTP.findOne({ email, otp });
      if (!otpRecord) {
          return res.status(400).json({ message: "Invalid or expired OTP!" });
      }

      await OTP.deleteOne({ _id: otpRecord._id });
      const userModelMap = {
        user: USER,
        admin: ADMIN,
        restaurant: RESTAURANT,
        delivery: DELIVERY
    };

    if (!userModelMap[role]) {
        return res.status(400).json({ message: "Invalid role!" });
    }

    const UserModel = userModelMap[role];

    const newUser= await UserModel.findById({_id});
    // console.log(newUser);
    
    const token = generateToken(newUser._id, newUser.role);
    console.log(token);
    
    createCookie(res, token);

    return res.status(200).json({
      message: `${role} Login successfull`,
      data: { 
        _id: newUser._id, 
        name: newUser.name, 
        email: newUser.email,
        phone: newUser.phone ,
        profilePic:newUser.profilePic, 
        role 
      },success:true
  });
      
      
  } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ message: "Failed to verify OTP", error: error.message ,success:false});
  }
};
