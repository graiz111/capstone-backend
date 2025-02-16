import express, { Router } from 'express'
import { deleteDeliveryAccount, delforgotpassword, deliveryeditProfilePic, deliveryforgotpassword, deliveryPersonLogin, deliveryPersonSignup, editProfile, getAllDeliveryP, getdeliverybooy, logOut } from '../controllers/deiveryBoyController.js'
import { otpverifypassword, passwordreset, verifyOtp, verifyOtpLogin } from '../controllers/sendOtpController.js'
import { deliveryBoyAuth } from '../middlewares/deliveryBoyAuth.js'
import { processUpload } from '../utils/cloudinary.js'
const router = express.Router()

router.post('/signup',processUpload,deliveryPersonSignup)
router.post('/otpverify',verifyOtp)
router.post('/login',deliveryPersonLogin)
router.post('/otploginverify',verifyOtpLogin)
router.get('/getdeliveryboy/:deliveryId',getdeliverybooy)
router.put('/editprofile',deliveryBoyAuth,editProfile)
router.put('/profilepicupdate',deliveryBoyAuth,processUpload,deliveryeditProfilePic)
router.delete('/delete',deliveryBoyAuth,deleteDeliveryAccount)
router.post('/forgot-password',delforgotpassword)
router.post('/verify-forgot-password-otp',otpverifypassword)
router.post('/reset-password',passwordreset)


export {router as deliveryBoyRoutes}