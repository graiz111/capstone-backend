import jwt from "jsonwebtoken";

export const deliveryBoyAuth = (req, res, next) => {
    try {
        console.log("hitted deliveryBoyAuth");
        
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "deliveryBoy not autherised", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!tokenVerified) {
            return res.status(401).json({ message: "deliveryBoy not autherised", success: false });
        }

        req.user = tokenVerified;

        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "deliveryBoy autherization failed", success: false });
    }
};