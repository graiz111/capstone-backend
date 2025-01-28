import express from 'express';
const router = express.Router()
import { admineditProfilePic, adminforgotpassword, adminLogin, adminSignup, deleteAccount, editProfile, logOut } from '../controllers/adminController.js';
import {adminAuth} from '../middlewares/adminAuth.js'
import { processUpload } from '../utils/cloudinary.js';
import { otpverifypassword, passwordreset, verifyOtp } from '../controllers/sendOtpController.js';
import { getAllUsers } from '../controllers/userController.js';
import { getAllRestaurants } from '../controllers/restaurantController.js';


router.post('/signup',processUpload,adminSignup)
router.post('/verifyotp',verifyOtp)
router.post('/login',adminLogin)
router.put('/editprofile',adminAuth,editProfile)
router.put('/profilepicupdate',adminAuth,processUpload,admineditProfilePic)
router.post('/forgotpassword',adminAuth,adminforgotpassword)
router.put('/verifyreset',adminAuth,otpverifypassword)
router.put('/passwordreset',adminAuth,passwordreset)
router.get('/userfetch',getAllUsers);
router.get('/getallres',getAllRestaurants)
router.post('/logout',adminAuth,logOut)
router.delete('/adminDelete',adminAuth,deleteAccount)


export  {router as adminRouter};