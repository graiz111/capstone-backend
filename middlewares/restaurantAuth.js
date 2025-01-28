import jwt from "jsonwebtoken";

export const restaurantAuth = (req, res, next) => {
    try {
        console.log("hitted restaurantAuth");
        
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "restaurant not autherised", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!tokenVerified) {
            return res.status(401).json({ message: "restaurant not autherised", success: false });
        }

        req.restaurant = tokenVerified;

        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "restaurant autherization failed", success: false });
    }
};