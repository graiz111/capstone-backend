import express from 'express';
import { userLogin,userSignup, deleteAccount, editProfilePic, editProfile, logOut, getAllUsers, addItemToCart, addRating, userforgotpassword, orderCreate} from '../controllers/userController.js';
const router = express.Router();
import { processUpload} from '../utils/cloudinary.js';
import { userAuth } from '../middlewares/userAuth.js';
import {  otpverifypassword, passwordreset,  verifyOtp } from '../controllers/sendOtpController.js';


router.post('/signup',processUpload,userSignup,);
router.post('/login',userLogin);
router.post('/userotpverify',verifyOtp)
router.put('/additemtocart', addItemToCart)
router.post('/order',orderCreate)
router.put('/addrating',addRating)
router.delete('/delete',userAuth,deleteAccount);

router.put('/editProfile',userAuth, editProfile);
router.put('/forgotpassword', userforgotpassword)
router.put('/otpverifyreset',otpverifypassword)
router.put('/resetpassword',userAuth,passwordreset)
router.put('/editprofilepic',userAuth,processUpload, editProfilePic);
router.post('/logout',userAuth, logOut);




export  {router as userRouter};
