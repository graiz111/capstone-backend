import { v2 as cloudinary } from 'cloudinary';

import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
// import { userAuth } from '../middlewares/userAuth.js';
// import { promisify } from 'util';
dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const getFolder = (type) => {
  ("Getting folder for type:", type);
  switch (type?.toLowerCase()) {
    case "user":
      return "user-profile-pics";
    case "admin":
      return "admin-profile-pics";
    case "restaurant":
      return "restaurant-items";
    case "delivery":
      return "delivery-boys"; 
    default:
      return "general";
  }
};
export const processUpload = (req, res, next) => {


  upload.single("file")(req, res, async (err) => {


    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    }

    // If no file is uploaded, just proceed to the next middleware
    if (!req.file) {

      req.cloudinaryResult = null; // Ensure it’s explicitly null, not undefined
      return next();
    }

    try {
  
      const uploadType = req.body.role || "general";


      // Upload the file to Cloudinary using the file path
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: getFolder(uploadType),
        transformation: [{ width: 500, height: 500, crop: "limit" }],
        resource_type: "auto",
      });

      // Delete the temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temporary file:", err);
      });


      req.cloudinaryResult = result;
      next();
    } catch (error) {
      // Delete the temporary file in case of error
      if (req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temporary file:", err);
        });
      }

      console.error("Cloudinary upload error:", error);
      return res.status(500).json({
        message: "Error uploading to Cloudinary",
        error: error.message,
      });
    }
  });
};
