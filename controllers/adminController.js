import { ADMIN } from "../models/adminModel.js";
import { createCookie } from "../utils/cookie.js";
import { generateToken } from "../utils/token.js";
import bcrypt from 'bcrypt'
import { sendOtp } from "./sendOtpController.js";

export const adminSignup= async (req,res,next)=>{
    try{
        
        const {name ,email,phone,password,profilePic,role}=req.body
        
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "all fields are required" });
        }
        const isAdminExist = await ADMIN.findOne({
            $or: [{ email }, { phone }]
          });
          
          if (isAdminExist) {
            return res.status(400).json({ message: "admin already exists" });
          }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const profilePicUrl = req.cloudinaryResult.secure_url;
          if (!profilePicUrl) {
            return res.status(400).json({ message: "File upload failed." });
          }
        

        const adminData = new ADMIN({ name, email, password: hashedPassword, phone, profilePic:profilePicUrl,role });
        await adminData.save();
        sendOtp(email,role)
        
        
        
       
     
 
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
 
}
export const adminLogin= async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        

        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const adminExist = await ADMIN.findOne({ email });

        if (!adminExist) {
            return res.status(404).json({ message: "admin does not exist try signup" });
        }

        const passwordMatch = bcrypt.compareSync(password, adminExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "admin not authenticated" });
        }

        const token = generateToken(adminExist._id);
        createCookie(res,token)
 

        delete adminExist._doc.password

        return res.json({ data: adminExist, message: "admin login successfully" });
    } catch (error) {

        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }

}
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

export const adminforgotpassword=async(req,res)=>{

  try{

    const {email}=req.body
    if(!email){
      return res.status(400).json({message:'email is mandatory '})
    }
    const user=await ADMIN.findOne({email})
    if(!user){
      res.status(500).json({message:'admin not found'})
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