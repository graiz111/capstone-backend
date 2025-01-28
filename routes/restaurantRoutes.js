import express from 'express';
import { deleteAccount, deleteOrder, editProfile, getAllOrdersForRestaurant, getAllRestaurants, getRatings, logOut, reseditProfilePic, resforgotpassword, resReview, restaurantLogin, restaurantSignup } from '../controllers/restaurantController.js';
import {restaurantAuth } from "../middlewares/restaurantAuth.js"
import { itemsRoutes } from './itemsRoutes.js';
import { otpverifypassword, passwordreset, verifyOtp } from '../controllers/sendOtpController.js';
import { processUpload } from '../utils/cloudinary.js';

const router = express.Router()


router.post('/signup',processUpload,restaurantSignup)
router.post('/verifyotp',verifyOtp)
router.post('/login',restaurantLogin)
router.put('/editprofile',restaurantAuth,editProfile)
router.put('/profilepicupload',processUpload,reseditProfilePic)
router.put('/forgotpassword', restaurantAuth,resforgotpassword)
router.put('/verifyreset',restaurantAuth ,otpverifypassword,passwordreset)
router.get('/fetchorders',getAllOrdersForRestaurant)
router.delete('/deleteorder',deleteOrder)
router.get('/fetchrating',getRatings)
router.post('/logout',restaurantAuth,logOut)
router.delete('/delete',restaurantAuth,deleteAccount)
router.post('/resreview',resReview)


export  {router as restaurantRouter};