import mongoose from "mongoose";

import { ADMIN } from "../models/adminModel.js";

import bcrypt from 'bcryptjs'

import { COUPON } from "../models/couponModel.js";
import { OTP } from "../models/otpModel.js";
import { sendOTP } from "../utils/otpMail.js";
import { USER } from "../models/userModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import { RESTAURANT } from "../models/restaurantModel.js";
import {ADDRESS} from '../models/addressModel.js'
import { ORDER } from "../models/orderModel.js";
import { COUPON_USAGE } from "../models/couponUsage.js";

export const adminSignup= async (req,res,next)=>{
    try {
      const { name, email, phone, password, role } = req.body;  // Include `role`
      
      if (!name || !email || !password || !phone || !role) {  // Validate `role`
          return res.status(400).json({ message: "All fields are required, including role." });
      }

      const isUserExist = await ADMIN.findOne({ $or: [{ email }, { phone }] });
      if (isUserExist) {
          return res.status(400).json({ message: "admin already exists" });
      }

      // Get uploaded profile pic URL
      const profilePicUrl = req.cloudinaryResult.secure_url;
      if (!profilePicUrl) {
        res.status(400).json({ message: "File upload failed." });
      }

      // Generate OTP and store it in OTP collection (Include `role`)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRecord = new OTP({ email, otp, role });  // Role is now included
      await otpRecord.save();

      // Send OTP to email
      await sendOTP(email,otp,role);

      return res.status(200).json({ 
          message: "OTP sent for verification", 
          email,
          profilePicUrl
      });

  } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
  }
 
}
export const adminLogin= async(req,res,next)=>{
    try {
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.status(400).json({ message: "all fields are needed" });
            }
    
            const userExist = await ADMIN.findOne({ email });
    
            if (!userExist) {
                return res.status(404).json({ message: "Admin not exist try signup" });
            }
    
            const passwordMatch = bcrypt.compareSync(password, userExist.password);
    
            if (!passwordMatch) {
                return res.status(401).json({ message: "password incorrect" });
            }
            // res.json({ message: "wait a moment" });
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpRecord = new OTP({ email:userExist.email, otp, role:userExist.role });  
            await otpRecord.save();
      
            // Send OTP to email
            await sendOTP(
              userExist.email,
              otp,
              userExist.role
          );
      
            return res.status(200).json({ 
                message: "OTP sent for verification", 
                _id:userExist._id,
                email
                
            });
    
        } catch (error) {
    
            return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        }

}
export const getadmin =async (req, res) => {
 
  
  const {_id}=req.query
  
  
  try {
    const user = await ADMIN.findById(_id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({data:user,success:true});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getAllusers =async (req, res) => {
  
  
  
  
  try {
    const user = await USER.find().select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const edituser= async (req, res) => {
  const { _id, name, email, phone } = req.body;
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      _id,
      { name, email, phone },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};
export const getAlldelivery =async (req, res) => {
  
  
  
  
  try {
    const user = await DELIVERY.find().select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({data:user,success:true});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res, next) => {
    try {
      const { name, email, phone, password, profilePic, _id } = req.body;
  
      
      const adminEdit = await ADMIN.findOne({ _id });
  
      if (!adminEdit) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      
      if (name) adminEdit.name = name;
      if (email) adminEdit.email = email;
      if (phone) adminEdit.phone = phone;
      if (password) {
       
        const hashedPassword = await bcrypt.hash(password, 10);
        adminEdit.password = hashedPassword;
      }
      if (profilePic) adminEdit.profilePic = profilePic;
  
      
      await adminEdit.save();

      adminEdit.password = undefined;//to remove the password from data
  
     
      return res.status(200).json({ message: 'Profile updated successfully', data: adminEdit });
    } catch (error) {
     
      return res.status(500).json({ message: 'internal Server error' });
    }
}
export const admineditProfilePic = async (req, res) => {
  try {
   

    const { id } = req.admin; 
    

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required.", success: false });
    }

    const profilePicUrl = req.cloudinaryResult?.secure_url;
    if (!profilePicUrl) {
      return res.status(400).json({ message: "File upload failed. Please try again.", success: false });
    }

    const admin = await ADMIN.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found.", success: false });
    }

    admin.profilePic = profilePicUrl;
    await admin.save();

    const { password, ...adminData } = admin._doc;

    res.status(200).json({
      message: "Profile picture updated successfully.",
      success: true,
      data: adminData,
    });
  } catch (error) {
    console.error("Error editing profile picture:", error);
    return res.status(500).json({ message: "Internal server error.", success: false });
  }
};
export const  toggleActivedelivery=async (req, res) => {
  const { id } = req.params; // Get the delivery ID from the URL parameter
  const { isActive } = req.body; // Get the new status from the request body
  
  try {
    // Update the delivery status in the database (assuming you're using MongoDB here as an example)
    const updatedDelivery = await DELIVERY.findByIdAndUpdate(
      id,
      { isActive: isActive === 'true' }, // Convert 'true'/'false' to boolean true/false
      { new: true } // Return the updated document
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(updatedDelivery); // Send the updated delivery back in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating status' });
  }
};
export const adminforgotpassword = async (req, res) => {
  try {
    

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is mandatory' });
    }


    const user = await ADMIN.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
 
    const role = user.role;

   
    const otpRecord = new OTP({ email, otp, role });
    await otpRecord.save();


    await sendOTP(email, otp, role);

    return res.status(200).json({ message: 'OTP sent successfully' ,success:true});
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const logOut= (req,res)=>{
  try{
    
    const {token} =req.cookies
 
    if (token){

      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        path: '/', 
      });
      res.status(200).json({ message: "Admin logout successfully"});


    }
  
  }
  catch{
    return res.status(500).json({ message: "Logout Server error" });

  }

}
export const deleteAccount=async (req,res)=>{
  try{
    const {name,_id}=req.body
    const adminDetails = await ADMIN.findByIdAndDelete(_id);

    res.status(200).json({ message: "Admin deleted successfully.", data: adminDetails });

    

  }
  catch{
    res.status(500).json({ message: "Internal server error." });

  }
}
export const fetchAllRestaurants = async (req, res) => {
  try {
   
    
    const restaurants = await RESTAURANT.find({}, { password: 0 }); 
    (restaurants);
    
    res.status(200).json({ success: true, data: restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching restaurants', error: err.message });
  }
};
export const fetchAllDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await DELIVERY.find({}, { password: 0 }); // Exclude passwords
    res.status(200).json({ success: true, data: deliveryPartners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching delivery partners', error: err.message });
  }
};

export const fetchAllOrders = async (req, res) => {
  try {
   
    
    const orders = await ORDER.find({})
      .populate('user_id', 'name email') 
      .populate('restaurant_id', 'name email') 
      .populate('deliveryBoyId', 'name email'); 
      
   
    
   
    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, message: 'No orders found', data: [] });
    }
    
    const userIds = orders
      .filter(order => order.user_id && order.user_id._id)
      .map(order => order.user_id._id);
      

    
    if (!userIds || userIds.length === 0) {
      
      return res.status(200).json({ 
        success: true, 
        message: 'Orders found but no valid user IDs for address lookup', 
        data: orders 
      });
    }
    
    try {
      const addresses = await ADDRESS.find({ user_id: { $in: userIds } });
   
      
      const addressMap = addresses.reduce((map, address) => {
       
        const userId = address.user_id.toString();
        if (!map[userId]) {
          map[userId] = [];
        }
        map[userId].push(address);
        return map;
      }, {});
      
      
      
      const ordersWithAddresses = orders.map(order => {
        let userId = null;
        
        if (order.user_id && order.user_id._id) {
          userId = order.user_id._id.toString();
        } else if (order.user_id) {
          userId = order.user_id.toString();
        }
        
        const userAddresses = userId ? (addressMap[userId] || []) : [];
        
        return {
          ...order.toObject(),
          user_addresses: userAddresses
        };
      });
      
      
      return res.status(200).json({ success: true, data: ordersWithAddresses });
    } catch (addressError) {
      console.error("Error fetching addresses:", addressError);
     
      return res.status(200).json({ 
        success: true, 
        message: 'Orders found but error fetching addresses',
        error: addressError.message,
        data: orders 
      });
    }
  } catch (err) {
    console.error("Error in fetchAllOrders:", err);
    return res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};



export const getCoupons = async (req, res) => {
  try {
    const coupons = await COUPON.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons", error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate } = req.body;

    // Validate input
    if (!code || !discountPercentage || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if coupon code already exists
    const existingCoupon = await COUPON.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Create new coupon
    const newCoupon = new COUPON({
      code: code.toUpperCase(),
      discountPercentage,
      expiryDate,
      isActive: true
    });

    await newCoupon.save();
    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon", error: error.message });
  }
};



export const validateCoupon = async (req, res) => {


  try {
    const { code, cartTotal, userId } = req.body;

    // Validate required fields
    if (!code || !cartTotal || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields (code, cartTotal, userId) are required",
      });
    }

    // Convert code to uppercase for consistency
    const couponCode = code.toUpperCase();

    // Find the coupon
    const coupon = await COUPON.findOne({
      code: couponCode,
      isActive: true,
    });

   

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if the coupon is expired
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Convert userId to ObjectId
    const userIdObject = new mongoose.Types.ObjectId(userId);

    // Check if the user has already used this coupon
    const existingUsage = await COUPON_USAGE.findOne({
      userId: userIdObject,
    });

    

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "You have already applied a coupon for this order",
      });
    }

    // Store the coupon usage (only one per user)
    await COUPON_USAGE.create({
      userId: userIdObject,
      couponCode: couponCode,
    });

    // Calculate discount
    const discountAmount = (cartTotal * coupon.discountPercentage) / 100;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      couponId: coupon._id,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      finalAmount: cartTotal - discountAmount,
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating coupon",
      error: error.message,
    });
  }
};


// export const validateCoupon = async (req, res) => {
//   try {
//     const { code, cartTotal } = req.body;

//     if (!code || !cartTotal) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code and cart total are required"
//       });
//     }

//     // Find the coupon
//     const coupon = await COUPON.findOne({
//       code: code.toUpperCase(),
//       isActive: true
//     });

//     // Check if coupon exists
//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid coupon code"
//       });
//     }

//     // Check if coupon has expired
//     if (new Date() > new Date(coupon.expiryDate)) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon has expired"
//       });
//     }

//     // Calculate discount
//     const discountAmount = (cartTotal * coupon.discountPercentage) / 100;

//     return res.status(200).json({
//       success: true,
//       message: "Coupon applied successfully",
//       discountPercentage: coupon.discountPercentage,
//       discountAmount,
//       finalAmount: cartTotal - discountAmount
//     });

//   } catch (error) {
//     console.error("Coupon validation error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error validating coupon"
//     });
//   }
// };

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await COUPON.findByIdAndDelete(id);
    
    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon", error: error.message });
  }
};