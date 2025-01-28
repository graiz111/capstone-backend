import express, { Router } from 'express'
import { deleteAccount, deliveryeditProfilePic, deliveryforgotpassword, deliveryPersonLogin, deliveryPersonSignup, editProfile, getAllDeliveryP, logOut } from '../controllers/deiveryBoyController.js'
import { otpverifypassword, passwordreset, verifyOtp } from '../controllers/sendOtpController.js'
import { deliveryBoyAuth } from '../middlewares/deliveryBoyAuth.js'
import { processUpload } from '../utils/cloudinary.js'
const router = express.Router()

router.post('/signup',processUpload,deliveryPersonSignup)
router.post('/verifyotp',verifyOtp)
router.post('/login',deliveryPersonLogin)
router.put('/editprofile',deliveryBoyAuth,editProfile)
router.put('/profilepicupdate',deliveryBoyAuth,processUpload,deliveryeditProfilePic)
router.put('/forgotpassword', deliveryBoyAuth,deliveryforgotpassword)
router.put('/verifyreset',deliveryBoyAuth,otpverifypassword)
router.put('/resetpassword',deliveryBoyAuth,passwordreset)
router.post('/logout',deliveryBoyAuth,logOut)
router.delete('/delete',deliveryBoyAuth,deleteAccount)


export {router as deliveryBoyRoutes}