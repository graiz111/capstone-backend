import { adminAuth } from "../middlewares/adminAuth.js";
import { deliveryBoyAuth } from "../middlewares/deliveryBoyAuth.js";
import { restaurantAuth } from "../middlewares/restaurantAuth.js";
import { userAuth } from "../middlewares/userAuth.js";
import { ADMIN } from "../models/adminModel.js";
import { DELIVERY } from "../models/deliverBoyModels.js";
import { RESTAURANT } from "../models/restaurantModel.js";
import { USER } from "../models/userModel.js";

export const checkRoleMiddleware = async (req, res, next) => {
  console.log("Entered checkRoleMiddleware");

  try {
    const { role } = req.params;

    switch (role) {
      case "user":
        return userAuth(req, res, next);
      case "admin":
        return adminAuth(req, res, next);
      case "delivery":
        return deliveryBoyAuth(req, res, next);
      case "restaurant":
        return restaurantAuth(req, res, next);
      default:
        return res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    console.error("Error in checkRoleMiddleware:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const UserEditDetails = async (req,res) => {
  console.log("hitted edit details user");
  
  try {
    console.log(req.params,req.body);
    
    const { role, id } = req.params;
    let updateData = req.body;

    const getModelByRole = (role) => {
      switch (role) {
        case "admin":
          return ADMIN;
        case "user":
          return USER;
        case "restaurant":
          return RESTAURANT;
        case "delivery":
          return DELIVERY;
        default:
          return null;
      }
    };

    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (req.cloudinaryResult && req.cloudinaryResult.secure_url) {
      const profilePicUrl = req.cloudinaryResult.secure_url;
      updateData.profilePic = profilePicUrl;
    }
    
   
    let updatedUser = await Model.findByIdAndUpdate(id, updateData, { new: true }).select("-password");


    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(updatedUser);
    

    res.status(200).json({ message: "User updated successfully", data: updatedUser,success:true });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getUserByRole = async (req,res) => {
  console.log("ntered getuserfunction");
  
  const {role,id}=req.params
console.log(req.params);

  try {
    const getModelByRole = (role) => {
      switch (role) {
        case "admin":
          return ADMIN;
        case "user":
          return USER;
        case "restaurant":
          return RESTAURANT;
        case "delivery":
          return DELIVERY;
        default:
          return null;
      }
    };

    const Model = getModelByRole(role);
    if (!Model) {
      return { error: "Invalid role provided" };
    }

    
    const user = await Model.findById(id).select("-password");
    if (!user) {
      return { error: "User not found" };
    }
    
    return res.status(200).json({message:"user found fetched",data:user})
    
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "Server Error" };
  }
};
export const logoutuseredit = async (req, res) => {
  console.log("Entered logout");

  const {token} =req.cookies
  try {
 console.log(token);
 
    if (token){

      res.clearCookie('token', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        path: '/', 
      });
      res.status(200).json({ message: "User logout successfully",success:true});
    }
    
  } catch (error) {
    console.error("Logout failed in server", error);
    return res.json({ success: false, message: "Logout failed in server" });
  }
};

