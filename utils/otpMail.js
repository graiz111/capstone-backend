import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Use the generated App Password here
  },
})


export const sendOTP = async (email, role ,otp) => {
  
  const message = `Your OTP for ${role} verification is: ${otp}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, 
    subject: `${role} OTP Verification`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${role} (${email}): ${otp}`);
    
    return otp;
  } catch (error) {
    console.error("Error sending OTP retry... ", error);
    throw error;
  }
};

