import express from 'express';
const router = express.Router()
import { admineditProfilePic, adminforgotpassword, adminLogin, adminSignup,createCoupon, deleteAccount, deleteCoupon,editProfile, edituser, fetchAllDeliveryPartners, fetchAllOrders, fetchAllRestaurants, getadmin, getAlldelivery, getAllusers, getCoupons, logOut, toggleActivedelivery, validateCoupon } from '../controllers/adminController.js';
import {adminAuth} from '../middlewares/adminAuth.js'
import { processUpload } from '../utils/cloudinary.js';
import { otpverifypassword, passwordreset, verifyOtp, verifyOtpLogin } from '../controllers/sendOtpController.js';
import { deleteuserAccount, getAllUsers } from '../controllers/userController.js';
import {deleteDeliveryAccount} from '../controllers/deiveryBoyController.js'
import { getAllRestaurants } from '../controllers/restaurantController.js';
import { addUser, deleteUser, editUser, toggleUserStatus } from '../controllers/adminEditController.js';


router.post('/signup',processUpload,adminSignup)
router.post('/otpverify',verifyOtp)
router.post('/login',adminLogin)
router.post('/otploginverify',verifyOtpLogin)
router.get('/users',getadmin)
router.get('/allusers',getAllusers)
router.get('/alldelivery',getAlldelivery)
router.put('/delivery/:id/status',toggleActivedelivery)
router.put('/editprofile',adminAuth,editProfile)
router.put('/profilepicupdate',adminAuth,processUpload,admineditProfilePic)
router.post('/forgot-password',adminforgotpassword)
router.post('/verify-forgot-password-otp',otpverifypassword)
router.post('/reset-password',passwordreset)
router.get('/userfetch',getAllUsers);
router.get('/resfetch',fetchAllRestaurants)
router.get('/deliveryfetch',fetchAllDeliveryPartners)
router.get('/ordersfetch',fetchAllOrders)
router.get('/coupons',adminAuth,getCoupons)
router.post('/addcoupons',adminAuth,createCoupon)
router.post('/couponsvalidate',adminAuth,validateCoupon)
router.delete('/deletecoupons/:id',adminAuth,deleteCoupon)


router.post('/add-user', addUser);

router.put('/edit-user', editUser);

router.delete('/delete-user', deleteUser);

router.put('/toggle-user-status', toggleUserStatus);


router.post('/logout',adminAuth,logOut)
router.delete('/adminDelete',adminAuth,deleteAccount)


export  {router as adminRouter};