import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



export const generateToken = (id, role) => {
    try {
        if (!role) {
            throw new Error("Server can't find role, try again");
        }
        return jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    } catch (error) {
        console.log(error);
        
        
    }
    
};



