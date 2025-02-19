import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/token.js";
import { createCookie } from "../utils/cookie.js";
import { DELIVERY } from '../models/deliverBoyModels.js';
import { RESTAURANT } from '../models/restaurantModel.js';

import { OTP } from '../models/otpModel.js';
import { sendOTP } from '../utils/otpMail.js';


export const deliveryPersonSignup= async (req,res,next)=>{
  ("entered signup");
  
    try {
      const { name, email, phone, password, role } = req.body;  
      
      if (!name || !email || !password || !phone || !role) {  
          return res.status(400).json({ message: "All fields are required, including role." });
      }

      const isUserExist = await DELIVERY.findOne({ $or: [{ email }, { phone }] });
      if (isUserExist) {
          return res.status(400).json({ message: "admin already exists" });
      }

      const profilePicUrl = req.cloudinaryResult?.secure_url || null;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRecord = new OTP({ email, otp, role });  
      await otpRecord.save();

      await sendOTP(email,otp,role);

      return res.status(200).json({ 
          message: "OTP sent for verification", 
          email,
          profilePicUrl,
          success:true
      });

  } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
  }
 
  }

export const deliveryPersonLogin= async(req,res,next)=>{
  ("entered login ");
  
    try {
               const { email, password } = req.body;
               (req.body,"reqbodydellogin");
               
       
               if (!email || !password) {
                   return res.status(400).json({ message: "all fields are needed" });
               }
       
               const userExist = await DELIVERY.findOne({ email });
       
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
export const getdeliverybooy =async (req, res) => {
  ('enteresd delivery get');
  
  const { deliveryId } = req.params; 

  (req.params);
  
  try {
    const user = await DELIVERY.findById(deliveryId).select("-password"); // Exclude password
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
  
      
      const deliveryPersonEdit = await DELIVERY.findOne({ _id });
  
      if (!deliveryPersonEdit) {
        return res.status(404).json({ message: 'deliveryPerson not found' });
      }
  
      
      if (name) deliveryPersonEdit.name = name;
      if (email) deliveryPersonEdit.email = email;
      if (phone) deliveryPersonEdit.phone = phone;
      if (password) {
       
        const hashedPassword = await bcrypt.hash(password, 10);
        deliveryPersonEdit.password = hashedPassword;
      }
      if (profilePic) deliveryPersonEdit.profilePic = profilePic;
  
      
      await deliveryPersonEdit.save();

      deliveryPersonEdit.password = undefined;//to remove the passwor from data
  
     
      return res.status(200).json({ message: 'Profile updated successfully', data: deliveryPersonEdit });
    } catch (error) {
     
      return res.status(500).json({ message: 'internal Server error' });
    }
};
export const deliveryeditProfilePic = async (req, res) => {
  try {
    const {  id } = req.user;

    if (!id) {
      return res.status(400).json({ message: "delivery ID are required." });
    }
    const profilePicUrl = req.cloudinaryResult.secure_url;
    if (!profilePicUrl) {
      return res.status(400).json({ message: "File upload failed." });
    }

    const user = await DELIVERY.findById(id);
    if (!user) {
      return res.status(404).json({ message: "deliver person not found." });
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
export const deliveryforgotpassword=async(req,res)=>{

  try{

    const {email}=req.body
    if(!email){
      return res.status(400).json({message:'email is mandatory '})
    }
    const user=await DELIVERY.findOne({email})
    if(!user){
      res.status(500).json({message:'delivery person not found'})
    }
    sendOtp(user.email,user.role)
    

  }
  catch{
    return res.status(500).json({ message: 'internal Server error' });

  }

}
export const deleteDeliveryAccount=async (req,res)=>{
  try{
    const {_id}=req.body
    (req.body);
    
    const user = await DELIVERY.findByIdAndDelete(_id);

    res.status(200).json({ message: "User deleted successfully.", data: user });

    

  }
  catch{
    res.status(500).json({ message: "Internal server error." });

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
      res.status(200).json({ message: "User logout successfully"});
    }
  
  }
  catch{
    return res.status(500).json({ message: "Logout Server error" });

  }

}
export const getAllDeliveryP = async (req, res) => {
  try {
    
    const deliveryPersons = await DELIVERY.find();

    if (!deliveryPersons || deliveryPersons.length === 0) {
      return res.status(404).json({ message: "No deliveryPersons found." });
    }

    delete deliveryPersons._doc.password
    const allDeliveryPersons = deliveryPersons;

    res.status(200).json({ message: "DeliveryPersons fetched successfully.", data: allDeliveryPersons });
  } catch (error) {
    console.error("Error fetching deliveryPersons:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const delforgotpassword = async (req, res) => {
  try {
    ("Entered del  forgot password");

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is mandatory' });
    }

    // Find restaurant user
    const user = await DELIVERY.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Delivery p not found' });
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