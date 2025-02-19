import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const verifyToken = (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.json({ success: false, message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    res.json({ success: true, user: decoded.user, role: decoded.role });
  } catch (err) {
    return res.json({ success: false, message: "Invalid token" });
  }
};
// export const verifttokenlogin=(req, res) => {
//   ('entered login token verify');
  
//   const token = req.cookies.token; 

  

//   if (!token) {
//     return res.status(401).json({ authenticated: false, message: "No token" });
//   }

//   try {
//     ('entered two');
//     const SECRET_KEY = process.env.JWT_SECRET_KEY
       
//     const decoded = jwt.verify(token, SECRET_KEY); 
//     (decoded);
//     res.json({ authenticated: true, user: decoded }); 
//   } catch (error) {
//     res.status(401).json({ authenticated: false, message: "Invalid token" });
//   }
// };
