import express from 'express';
import { userLogin,userSignup, editProfilePic, editProfile, logOut,  addRating, getuser, deleteuserAccount, placeCodOrder, getOrdersByUserId, userforgotpassword} from '../controllers/userController.js';
const router = express.Router();
import { processUpload} from '../utils/cloudinary.js';
import { userAuth } from '../middlewares/userAuth.js';
import {  otpverifypassword, passwordreset,  verifyOtp, verifyOtpLogin } from '../controllers/sendOtpController.js';

import { deleteAddress, handleUserAddresses } from '../controllers/addressController.js';
import { getCoupons } from '../controllers/adminController.js';


router.post('/signup',processUpload,userSignup,);
router.post('/otpverify',verifyOtp)
router.get('/user/:_id',getuser)
router.post('/login',userLogin);
router.post('/otploginverify',verifyOtpLogin)
router.post('/addresses',handleUserAddresses)
router.delete('/deladdresses',userAuth,deleteAddress)
router.post('/order/place',userAuth,placeCodOrder)
router.get('/orders/:userId',userAuth,getOrdersByUserId)
router.put('/addrating',addRating)
router.delete('/delete',userAuth,deleteuserAccount);
router.get('/couponsfetch',getCoupons)

// router.post('/applycoupon',applyCoupon);
router.put('/editProfile',userAuth, editProfile);
router.post('/forgot-password',userforgotpassword)
router.post('/verify-forgot-password-otp',otpverifypassword)
router.post('/reset-password',passwordreset)
router.put('/editprofilepic',userAuth,processUpload, editProfilePic);
router.post('/logout',userAuth, logOut);




export  {router as userRouter};
