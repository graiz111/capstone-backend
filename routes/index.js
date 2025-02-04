import express from 'express';
const app=express()
const router = express.Router();
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import { userRouter } from './userRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { restaurantRouter } from './restaurantRoutes.js';
import { deliveryBoyRoutes } from './deliveryBoyRoutes.js';
import { itemsRoutes } from './itemsRoutes.js';


app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true })); 

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/restaurant', restaurantRouter);
router.use('/delivery',deliveryBoyRoutes)
router.use('/restaurantadd',itemsRoutes)







export { router as mainRouter };
