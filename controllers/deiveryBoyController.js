import bcrypt from 'bcrypt'
import { generateToken } from "../utils/token.js";
import { createCookie } from "../utils/cookie.js";
import { DELIVERY } from '../models/deliverBoyModels.js';
import { RESTAURANT } from '../models/restaurantModel.js';
import { sendOtp } from './sendOtpController.js';


export const deliveryPersonSignup= async (req,res,next)=>{
    try{
        
        const {name ,email,phone,password,profilePic,role}=req.body
        
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "all fields are required" });
        }
        const deliveryPersonExist = await DELIVERY.findOne({
            $or: [{ email }, { phone }]
          });
          
          if (deliveryPersonExist) {
            return res.status(400).json({ message: "deliveryPerson already exists" });
          }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const profilePicUrl = req.cloudinaryResult.secure_url;
        if (!profilePicUrl) {
          return res.status(400).json({ message: "File upload failed." });
        }
      
        

        const deliveryPersonData = new DELIVERY({ name, email, password: hashedPassword, phone, profilePic : profilePicUrl,role });
        await deliveryPersonData.save();
        delete deliveryPersonData._doc.password

        sendOtp(deliveryPersonData.email,deliveryPersonData.role)
        
        
       
       
     
 
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
 
  }

export const deliveryPersonLogin= async(req,res,next)=>{
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const deliveryPersonExist = await DELIVERY.findOne({ phone });

        if (!deliveryPersonExist) {
            return res.status(404).json({ message: "deliveryPerson does not exist try signup" });
        }

        const passwordMatch = bcrypt.compareSync(password, deliveryPersonExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "deliveryPerson not authenticated" });
        }

        const token = generateToken(deliveryPersonExist._id);
        createCookie(res,token)
        

        delete deliveryPersonExist._doc.password

        return res.json({ data: deliveryPersonExist, message: "deliveryPerson login successfully" });
    } catch (error) {

        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }

}
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
export const deleteAccount=async (req,res)=>{
  try{
    const {name,_id}=req.body
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