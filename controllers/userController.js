import { USER } from "../models/userModel.js";
import bcrypt from 'bcrypt'
import { ITEMS } from "../models/itemsModel.js";
import { CART } from "../models/cartModel.js";
import { REVIEW } from "../models/reviewModel.js";
import {ORDER} from '../models/orderModel.js'
import {ADDRESS} from '../models/addressModel.js'
import { sendOtp, verifyOtp } from "./sendOtpController.js";
import { RESTAURANT } from "../models/restaurantModel.js";
import { generateToken } from "../utils/token.js";
import { createCookie } from "../utils/cookie.js";



export const userSignup= async (req,res,next)=>{
    try{
        
        const {name ,email,phone,password,profilePic,role}=req.body
        console.log(req.body);
        
        
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "all fields are required" });
        }
        const isUserExist = await USER.findOne({
            $or: [{ email }, { phone }]
          });
          
          if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
          }
          

          const profilePicUrl = req.cloudinaryResult.secure_url;
          if (!profilePicUrl) {
            return res.status(400).json({ message: "File upload failed." });
          }

        const hashedPassword = bcrypt.hashSync(password, 10);
        

        const userData = new USER({ name, email, password: hashedPassword, phone, profilePic :profilePicUrl  ,role });
        await userData.save();

       
        sendOtp(userData.email,userData.role)

        
        
        
        return res.json({ data: userData, message: "send for verification otp" });
       
     
 
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
 
  }

export const userLogin= async(req,res,next)=>{
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const userExist = await USER.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "user does not exist try signup" });
        }

        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "user not authenticated" });
        }

        const token = generateToken(userExist._id,userExist.role);
        createCookie(res,token)
        

        delete userExist._doc.password

        return res.json({ data: userExist, message: "user login successfully" });
    } catch (error) {

        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }

}
export const editProfile = async (req, res, next) => {
    try {
      const { name, email, phone, password,_id } = req.body;
  
      
      const userEdit = await USER.findOne({ _id });
  
      if (!userEdit) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      
      if (name) userEdit.name = name;
      if (email) userEdit.email = email;
      if (phone) userEdit.phone = phone;
      if (password) {
       
        const hashedPassword = await bcrypt.hash(password, 10);
        userEdit.password = hashedPassword;
      }
      
  
      
      await userEdit.save();

      delete userEdit._doc.password
  
     
      return res.status(200).json({ message: 'Profile updated successfully', data: userEdit });
    } catch (error) {
     
      return res.status(500).json({ message: 'internal Server error' });
    }
};

export const deleteAccount=async (req,res)=>{
  try{
    console.log("hitted del");
    
    const {name,_id}=req.body
    const user = await USER.findByIdAndDelete(_id);
    console.log(user)

    res.status(200).json({ message: "User deleted successfully.", data: user });

    

  }
  catch{
    res.status(500).json({ message: "Internal server error." });

  }
}


export const editProfilePic = async (req, res) => {
  try {
    const id=req.user.id

    if (!id) {
      return res.status(400).json({ message: "user ID are required." });
    }
    const profilePicUrl = req.cloudinaryResult.secure_url;
    if (!profilePicUrl) {
      return res.status(400).json({ message: "File upload failed." });
    }

    const user = await USER.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
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
      res.status(200).json({ message: "User logout successfully"});
    }
  
  }
  catch{
    return res.status(500).json({ message: "Logout Server error" });

  }

}


export const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");

    const users = await USER.find().select('-password').lean();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found.", success: false });
    }

    res.status(200).json({
      message: "Users fetched successfully.",
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error.", success: false });
  }
};

export const userforgotpassword=async(req,res)=>{

  try{

    const {email}=req.body
    if(!email){
      return res.status(400).json({message:'email is mandatory '})
    }
    const user=await USER.findOne({email})
    if(!user){
      res.status(500).json({message:'user not found'})
    }
    sendOtp(user.email,user.role)
    

  }
  catch{
    return res.status(500).json({ message: 'internal Server error' });

  }

}

export const addItemToCart = async (req, res) => {
  try {
    const { user_id, restaurant_id, item_id, quantity } = req.body;

    if (!user_id || !restaurant_id || !item_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if the restaurant exists
    const restaurant = await RESTAURANT.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Check if the food item exists
    const foodItem = await ITEMS.findById(item_id);
    if (!foodItem) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Check if the cart exists for the user
    let cart = await CART.findOne({ user: user_id, restaurant: restaurant_id });

    if (!cart) {
      cart = new CART({
        user: user_id,
        restaurant: restaurant_id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.item.toString() === item_id);

    if (existingItem) {
      // Update quantity if the item already exists
      existingItem.quantity += quantity;
    } else {
      // Add new item to the cart
      cart.items.push({ item: item_id, quantity });
    }

    // Update the total price
    cart.totalPrice += foodItem.price * quantity;

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const orderCreate = async (req, res) => {
  try {
    const { user_id, address, cart_id, paymentMethod } = req.body;

    // Validate inputs
    if (!user_id || !address || !cart_id || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the cart
    const cart = await CART.findById(cart_id).populate('items.item');
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart not found or empty." });
    }

    // Extract restaurant_id from the cart directly (not from items)
    const restaurantId = cart.restaurant_id; 
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant not found in cart." });
    }

    // Prepare order items with price included
    const orderItems = cart.items.map(item => ({
      item: item.item._id,
      quantity: item.quantity,
      price: item.item.price,
    }));

    // Calculate total price
    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create a new order
    const order = new ORDER({
      user_id: user_id,
      restaurant_id: restaurantId,
      items: orderItems,
      totalPrice,
      address,
      paymentMethod,
      status: 'Placed', // Valid enum value
    });

    // Save the order
    await order.save();

    // Clear the cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
};


export const coddelivery=async(req,res)=>{
  try {
    const { user_id, shipping_address, cart_id } = req.body;

    
    const cart = await CART.findById(cart_id);
    
    
    const order = new ORDER({
      user_id,
      restaurant_id: cart.items[0].restaurant_id, 
      items: cart.items,
      total_amount: cart.total_amount,
      shipping_address,
      order_status: 'placed',
    });

    
    await order.save();

    
    cart.items = [];
    cart.total_amount = 0;
    await cart.save();

    res.status(200).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
}
export const addaddresspayment =async(req,res)=>{
  try {
    const {userId}=req.user.id
    if(!userId){
      return res.status(400).json({message:'user not found '})
    }
    const address= await ADDRESS.findOne({user_id:userId})
    if(!address){
      return res.status(400).json({message:'user address not found '})

    }
    res.status(200).json({message:'address fetched ',data:address})

  } catch (error) {
    
  }
}
export const addRating=async(req, res)=>{
  const { userId, restaurantId, rating, comment } = req.body;

  try {
    // Check if the user has already rated this restaurant
    const existingReview = await REVIEW.findOne({ user: userId, restaurant: restaurantId });

    if (existingReview) {
      existingReview.rating=rating,
      existingReview.comment=comment
      existingReview.save()
      return res.status(400).json({ message: 'You  rated this restaurant.' });
    }

    const newReview = new REVIEW({
      user: userId,
      restaurant: restaurantId,
      rating,
      comment,
    });

    await newReview.save();

    res.status(201).json({
      message: 'Rating added successfully.',
      review: newReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding rating', error });
  }
}




  