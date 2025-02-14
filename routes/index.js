import express from 'express';

const router = express.Router();

import { userRouter } from './userRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { restaurantRouter } from './restaurantRoutes.js';
import { deliveryBoyRoutes } from './deliveryBoyRoutes.js';
import { itemsRoutes } from './itemsRoutes.js';
import {UsersEditRoutes} from './UsersEditRoutes.js'
import { verifttokenlogin, verifyToken } from '../middlewares/VerifyToken.js';
import { logoutuseredit } from '../controllers/UserEditDetails.js';


  

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/restaurant', restaurantRouter);
router.use('/delivery',deliveryBoyRoutes)
router.use('/restaurantadd',itemsRoutes)
router.use('/usersall',UsersEditRoutes)
router.get('/auth/verify-token',verifyToken,)
router.get('/auth/verify',verifttokenlogin,)
router.post('/auth/logout',logoutuseredit)









export { router as mainRouter };
