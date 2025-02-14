import express from 'express';
import { userLogin,userSignup, editProfilePic, editProfile, logOut,  addRating, userforgotpassword, orderCreate, validateCoupon, applyCoupon, getuser, deleteuserAccount} from '../controllers/userController.js';
const router = express.Router();
import { processUpload} from '../utils/cloudinary.js';
import { userAuth } from '../middlewares/userAuth.js';
import {  otpverifypassword, passwordreset,  verifyOtp, verifyOtpLogin } from '../controllers/sendOtpController.js';
import { addItemToCart, getUserCart } from '../controllers/cartController.js';


router.post('/signup',processUpload,userSignup,);
router.post('/otpverify',verifyOtp)
router.get('/user/:_id',getuser)
router.post('/login',userLogin);
router.post('/otploginverify',verifyOtpLogin)
router.post('/additemtocart',userAuth,addItemToCart)
router.get('/cart/:userId', userAuth, getUserCart);
router.post('/order',orderCreate)
router.put('/addrating',addRating)
router.delete('/delete',userAuth,deleteuserAccount);
router.post ('/validatecoupons',validateCoupon)
router.post('/applycoupon',applyCoupon);
router.put('/editProfile',userAuth, editProfile);
router.put('/forgotpassword', userforgotpassword)
router.put('/otpverifyreset',otpverifypassword)
router.put('/resetpassword',userAuth,passwordreset)
router.put('/editprofilepic',userAuth,processUpload, editProfilePic);
router.post('/logout',userAuth, logOut);




export  {router as userRouter};
