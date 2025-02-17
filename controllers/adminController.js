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
  console.log('enteresd admin get');
  
  const {_id}=req.query
  console.log(req.query);
  
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
  console.log('enteresd admin all users get');
  
  
  
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
  console.log('enteresd admin all users get');
  
  
  
  try {
    const user = await DELIVERY.find().select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
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
    console.log("adminEditProfilePic endpoint hit");

    const { id } = req.admin; 
    console.log("Authenticated admin:", req.admin);

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
    console.log("Entered forgot password");

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is mandatory' });
    }

    // Find restaurant user
    const user = await ADMIN.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Extract role from user
    const role = user.role;

    // Save OTP record
    const otpRecord = new OTP({ email, otp, role });
    await otpRecord.save();

    // Send OTP via email
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
    console.log("entered fetch all users in res admin");
    
    const restaurants = await RESTAURANT.find({}, { password: 0 }); 
    console.log(restaurants);
    
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
      
    console.log(`Extracted ${userIds.length} user IDs`);
    
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

export const coupons=async(req,res)=>{
  try {
    const { code, discount, expiresAt } = req.body;
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingCoupon = await COUPON.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new COUPON({
      code,
      discount,
      expiresAt,
      createdBy: req.user.id,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error creating coupon", error });
  }
}
export const deletecoupon=async(req,res)=>{
  try {
    console.log("delete coupon hit ");
    
    const {code}=req.body
    if(!code){
      res.status(400).json({message:"coupon not found"})
    }

    const coupon = await COUPON.findOne({code});
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found in database" });
    }
    console.log(coupon);
    

    await coupon.deleteOne();
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    
  }
}