import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



export const generateToken = (id, role) => {
    try {
        if(!role){
            return res.status(500).json({message:'server cant find role try again'})
        }
        var token = jwt.sign({ id: id, role: role }, process.env.JWT_SECRET_KEY);
        return token;
    } catch (error) {
        console.log(error);
    }
};