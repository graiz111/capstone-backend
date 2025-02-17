import express from 'express';

const router = express.Router();

import { userRouter } from './userRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { orderRoutes } from './orderRoutes.js';
import { restaurantRouter } from './restaurantRoutes.js';
import { deliveryBoyRoutes } from './deliveryBoyRoutes.js';
import { itemsRoutes } from './itemsRoutes.js';
import {UsersEditRoutes} from './UsersEditRoutes.js'
import { verifyToken } from '../middlewares/VerifyToken.js';
import { logoutuseredit } from '../controllers/UserEditDetails.js';
import { cartRoutes } from './cartRoutes.js';
import { createCheckoutSession, sessionrest} from '../controllers/paymentController.js';


router.post('/payment/create-checkout-session', createCheckoutSession);
router.get("/payment/session-status", sessionrest);


router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/restaurant', restaurantRouter);
router.use('/delivery',deliveryBoyRoutes)
router.use('/restaurantadd',itemsRoutes)
router.use('/usersall',UsersEditRoutes)
router.use("/orders", orderRoutes);
router.use("/cart",cartRoutes)
router.get('/auth/verify-token',verifyToken,)

router.post('/auth/logout',logoutuseredit)









export { router as mainRouter };
