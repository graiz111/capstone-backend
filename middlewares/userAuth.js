import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  try {
    console.log("User authentication middleware hit");

    // Check if the token exists in cookies
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "User not authorized, token missing",
        success: false,
      });
    }

    // Verify the token
    const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!tokenVerified) {
      return res.status(401).json({
        message: "User not authorized, invalid token",
        success: false,
      });
    }

    // Log the verified payload (optional)
    console.log("Token verified:", tokenVerified);

    // Attach the user payload to the request object
    req.user = tokenVerified;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("User authentication error:", error.message);

    // Handle specific JWT errors if needed
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token format",
        success: false,
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please log in again",
        success: false,
      });
    }

    return res.status(401).json({
      message: "User authorization failed",
      success: false,
    });
  }
};
