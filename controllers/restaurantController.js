import bcrypt from 'bcrypt'
import { RESTAURANT } from '../models/restaurantModel.js';
import { generateToken } from '../utils/token.js';
import { createCookie } from '../utils/cookie.js';
import { REVIEW } from '../models/reviewModel.js';

import { USER } from '../models/userModel.js';
import { CART } from '../models/cartModel.js';
import {ORDER} from '../models/orderModel.js'
import { OTP } from '../models/otpModel.js';
import { sendOTP } from '../utils/otpMail.js';
import { log } from 'console';



export const restaurantSignup= async (req,res,next)=>{
    try {
          const { name, email, phone, password, role } = req.body;  // Include `role`
          
          if (!name || !email || !password || !phone || !role) {  // Validate `role`
              return res.status(400).json({ message: "All fields are required, including role." });
          }
    
          const isUserExist = await RESTAURANT.findOne({ $or: [{ email }, { phone }] });
          if (isUserExist) {
              return res.status(400).json({ message: "Restaurant already exists" });
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

export const restaurantLogin= async(req,res,next)=>{
    try {
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.status(400).json({ message: "all fields are needed" });
            }
    
            const userExist = await RESTAURANT.findOne({ email });
    
            if (!userExist) {
                return res.status(404).json({ message: "Restaurant not exist try signup" });
            }
    
            const passwordMatch = bcrypt.compareSync(password, userExist.password);
    
            if (!passwordMatch) {
                return res.status(401).json({ message: "password incorrect" });
            }
            // res.json({ message: "wait a moment" });
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpRecord = new OTP({ email:userExist.email, otp, role:userExist.role });  // Role is now included
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
export const editProfile = async (req, res, next) => {
    try {
      const { name, email, phone, password, profilePic, _id } = req.body;
  
      
      const restaurantEdit = await RESTAURANT.findOne({ _id });
  
      if (!restaurantEdit) {
        return res.status(404).json({ message: 'restaurant not found' });
      }
  
      
      if (name) restaurantEdit.name = name;
      if (email)restaurantEdit.email = email;
      if (phone) restaurantEdit.phone = phone;
      if (password) {
       
        const hashedPassword = await bcrypt.hash(password, 10);
        restaurantEdit.password = hashedPassword;
      }
      if (profilePic) restaurantEdit.profilePic = profilePic;
  
      
      await restaurantEdit.save();

      restaurantEdit.password = undefined;//to remove the passwor from data
  
     
      return res.status(200).json({ message: 'restaurantProfile updated successfully', data: restaurantEdit });
    } catch (error) {
     
      return res.status(500).json({ message: 'internal Server error' });
    }
};
export const reseditProfilePic = async (req, res) => {
  try {
    const {  id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "restaurant ID are required." });
    }
    const profilePicUrl = req.cloudinaryResult.secure_url;
    if (!profilePicUrl) {
      return res.status(400).json({ message: "File upload failed." });
    }

    const user = await RESTAURANT.findById(id);
    if (!user) {
      return res.status(404).json({ message: "restaurant not found." });
    }

    user.profilePic = profilePicUrl;
    await user.save();
    delete user._doc.password

    res.status(200).json({ 
      message: "Profile picture updated successfully.", 
      data: user 
    });

  } catch (error) {
    console.error("Error editing profile picture:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const resforgotpassword=async(req,res)=>{

  try{

    const {email}=req.body
    if(!email){
      return res.status(400).json({message:'email is mandatory '})
    }
    const user=await RESTAURANT.findOne({email})
    if(!user){
      res.status(500).json({message:'restaurant not found'})
    }
    sendOtp(user.email,user.role)
    

  }
  catch{
    return res.status(500).json({ message: 'internal Server error' });

  }

}
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
        res.status(200).json({ message: "restaurant logout successfully"});
      }
    
    }
    catch{
      return res.status(500).json({ message: "Logout Server error" });
  
    }
  
}
export const deleteAccount=async (req,res)=>{
  try{
    const {_id}=req.body
    const restaurant = await RESTAURANT.findByIdAndDelete(_id);

    res.status(200).json({ message: "Restaurant deleted successfully.", data: restaurant });

  }
  catch{
    res.status(500).json({ message: "Internal server error." });

  }
}
export const getAllRestaurants = async (req, res) => {
    
    const {res_id}=req.params
    
    try {
      const user = await RESTAURANT.findById(res_id).select("-password"); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  
    
};
export const getAllOrdersForRestaurant = async (req, res) => {
  try {
    const { id: restaurantId } = req.body

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required.", success: false });
    }

    const orders = await ORDER.find({ restaurant_id: restaurantId })
      .populate("items.item", "name price") 
      .populate("user_id", "name email")   
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this restaurant.", success: false });
    }

    res.status(200).json({
      message: "Orders fetched successfully.",
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders for restaurant:", error);
    res.status(500).json({ message: "Internal server error.", success: false });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const { id: restaurantId ,orderId} = req.body; // Assuming restaurant is authenticated
     // Order ID from the route parameter

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required.", success: false });
    }

    // Find the order by ID and ensure it belongs to the restaurant
    const order = await ORDER.findOne({ _id: orderId, restaurant_id: restaurantId });

    if (!order) {
      return res.status(404).json({ message: "Order not found or does not belong to this restaurant.", success: false });
    }

    // Delete the order
    await ORDER.deleteOne({ _id: orderId });

    res.status(200).json({
      message: "Order deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error.", success: false });
  }
};


export const orders=async(req,res)=>{
  try {
    const {user_id,cart_id}=req.body
    const user=await USER.findOne({user_id})
    if(!user){
      res.status(400).json({message:'user not found'})
    }
    const items=await CART.findById({cart_id})
    if(!items){
      res.status(400).json({message:'items not found'})
    }

    res.status(200).json({message:'order fetched successfully',userData:user,itemData:items})
    
  } catch (error) {
    
  }
}

export const resReview=async(req,res)=>{
  try{
    const {latestReview,_id}=req.body
    console.log(req.body);
    
    if(!latestReview){
      return res.status(500).json({message:"no review found"})

    }
    const reviewedRestaurant=await RESTAURANT.findOne({_id})
    if(!reviewedRestaurant){
      return res.status(500).json({message:"no restaurant  found"})

    }
    reviewedRestaurant.review=latestReview
    console.log(reviewedRestaurant);
    
    reviewedRestaurant.save()
    res.status(200).json({data:reviewedRestaurant,message:"review added successfully"})


  }
  catch{
    return res.status(500).json({message:'internal server error'})
  }

}
export const getRatings=async(req, res)=>{
  const { restaurantId } = req.params;

  try {
    
    const reviews = await REVIEW.find({ restaurant: restaurantId }).populate('user', 'name');


    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;

    res.status(200).json({
      message: 'Ratings fetched successfully.',
      averageRating: averageRating.toFixed(1),
      totalRatings: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching ratings', error });
  }
}


