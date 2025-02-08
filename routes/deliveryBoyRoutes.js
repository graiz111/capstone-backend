import express, { Router } from 'express'
import { deleteDeliveryAccount, deliveryeditProfilePic, deliveryforgotpassword, deliveryPersonLogin, deliveryPersonSignup, editProfile, getAllDeliveryP, getdeliverybooy, logOut } from '../controllers/deiveryBoyController.js'
import { otpverifypassword, passwordreset, verifyOtp, verifyOtpLogin } from '../controllers/sendOtpController.js'
import { deliveryBoyAuth } from '../middlewares/deliveryBoyAuth.js'
import { processUpload } from '../utils/cloudinary.js'
const router = express.Router()

router.post('/signup',processUpload,deliveryPersonSignup)
router.post('/otpverify',verifyOtp)
router.post('/login',deliveryPersonLogin)
router.post('/otploginverify',verifyOtpLogin)
router.get('/users',getdeliverybooy)
router.put('/editprofile',deliveryBoyAuth,editProfile)
router.put('/profilepicupdate',deliveryBoyAuth,processUpload,deliveryeditProfilePic)
router.put('/forgotpassword', deliveryBoyAuth,deliveryforgotpassword)
router.put('/verifyreset',deliveryBoyAuth,otpverifypassword)
router.put('/resetpassword',deliveryBoyAuth,passwordreset)
router.post('/logout',deliveryBoyAuth,logOut)
router.delete('/delete',deliveryBoyAuth,deleteDeliveryAccount)


export {router as deliveryBoyRoutes}