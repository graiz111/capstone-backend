
import { USER } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import { CART } from "../models/cartModel.js";
import { REVIEW } from "../models/reviewModel.js";
import {ORDER} from '../models/orderModel.js'
import { COUPON } from "../models/couponModel.js";
import { OTP } from "../models/otpModel.js";
import { sendOTP } from "../utils/otpMail.js";



export const userSignup = async (req, res, next) => {
  try {
      const { name, email, phone, password, role } = req.body;  
      
      if (!name || !email || !password || !phone || !role) {  
          return res.status(400).json({ message: "All fields are required, including role." });
      }

      const isUserExist = await USER.findOne({ $or: [{ email }, { phone }] });
      if (isUserExist) {
          return res.status(400).json({ message: "User already exists" });
      }

      // Check if Cloudinary uploaded an image
      const profilePicUrl = req.cloudinaryResult?.secure_url || null;

      // Generate OTP and store it in OTP collection
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRecord = new OTP({ email, otp, role });
      await otpRecord.save();

      // Send OTP to email
      await sendOTP(email, otp, role);

      return res.status(200).json({ 
          message: "OTP sent for verification", 
          email,
          profilePicUrl ,
          success:true // Will be `null` if no image was uploaded
      });

  } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const userLogin= async(req,res,next)=>{
  console.log('login controller');
  
    try {
        const { email, password } = req.body;
        console.log(req.body);
        

        if (!email || !password) {
            return res.status(400).json({ message: "all fields are needed" });
        }

        const userExist = await USER.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "user does not exist try signup" });
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
export const getuser =async (req, res) => {

  
  const {_id}=req.params

  try {
    const user = await USER.findById(_id).select("-password"); // Exclude password
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

export const deleteuserAccount=async (req,res)=>{
  try{
    console.log("hitted del");
    
    const {_id}=req.body
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
      const users = await USER.find({}, { password: 0 }); // Exclude passwords
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
    }
  };
export const userforgotpassword = async (req, res) => {
  try {
    console.log("Entered forgot password");

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is mandatory' });
    }

    // Find restaurant user
    const user = await USER.findOne({ email });
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



export const placeCodOrder = async (req, res) => {
  try {
    const { user_id, cart_id, addressId } = req.body;

    // Validate inputs
    if (!user_id || !cart_id || !addressId) {
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
      address: addressId,
      paymentMethod: 'COD',
      status: 'Placed', // Valid enum value
    });

    // Save the order
    await order.save();

    // Clear the cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("Error placing COD order:", error);
    res.status(500).json({ message: "Error placing COD order", error });
  }
};
export const getOrdersByUserId = async (req, res) => {
  try {
    console.log("entered order fetch");

    const { userId } = req.params;
    console.log(req.user, "user");

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find all orders for the user and populate the necessary fields
    const orders = await ORDER.find({ user_id: userId })
      .populate({
        path: 'restaurant_id',
        select: 'name', // Only select the 'name' field of the restaurant
      })
      .populate({
        path: 'items.item_id',
        select: 'name', // Only select the 'name' field of the item
      })
      .populate({
        path: 'user_id',
        select: 'address', // Assuming the user model has an 'address' field
      });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    console.log(orders);

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders by user ID:", error);
    res.status(500).json({ message: "Error fetching orders by user ID", error });
  }
};
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await COUPON.findOne({ code, isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    res.status(200).json({ message: "Coupon is valid", discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ message: "Error validating coupon", error });
  }
};



export const applyCoupon = async (req, res) => {
  try {
    const { orderId, couponCode } = req.body;
    console.log(req.body);
    

    // 🛑 Ensure order exists before proceeding
    const order = await ORDER.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛑 Ensure required fields exist before applying coupon
    if (!order.user_id || !order.restaurant_id) {
      return res.status(400).json({ message: "Invalid order: Missing user_id or restaurant_id" });
    }

    const coupon = await COUPON.findOne({ code: couponCode, isActive: true });
    if (!coupon) return res.status(400).json({ message: "Invalid or expired coupon" });

    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const discountAmount = (order.totalPrice * coupon.discount) / 100;
    const newTotal = Math.max(order.totalPrice - discountAmount, 0);

    order.totalPrice = newTotal;
    order.coupon = coupon._id;
    await order.save();

    res.status(200).json({ message: "Coupon applied successfully", newTotal });
  } catch (error) {
    res.status(500).json({ message: "Error applying coupon", error });
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





  