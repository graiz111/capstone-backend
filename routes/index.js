import express from 'express';

const router = express.Router();

import { userRouter } from './userRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { restaurantRouter } from './restaurantRoutes.js';
import { deliveryBoyRoutes } from './deliveryBoyRoutes.js';
import { itemsRoutes } from './itemsRoutes.js';





router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/restaurant', restaurantRouter);
router.use('/delivery',deliveryBoyRoutes)
router.use('/restaurantadd',itemsRoutes)







export { router as mainRouter };
