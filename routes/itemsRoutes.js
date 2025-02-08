import express from 'express';
import { addItemToRestaurant, deleteItemFromRestaurant, getItemsByRestaurant, updateItem } from '../controllers/addItemsController.js';
import { processUpload } from '../utils/cloudinary.js';
import {restaurantAuth} from '../middlewares/restaurantAuth.js'
const router = express.Router();

router.post('/additem',restaurantAuth,processUpload,addItemToRestaurant)
router.put('/updateitem/:item_id',restaurantAuth,processUpload,updateItem)
router.get('/getallitems/:restaurant_id',restaurantAuth, getItemsByRestaurant);
router.delete('/deleteitem/:item_id',restaurantAuth,deleteItemFromRestaurant)



export{router as itemsRoutes}