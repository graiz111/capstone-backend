import express from 'express';
import { addItemToRestaurant, deleteItemFromRestaurant, getItemsall, getItemsByRestaurant, getRestaurantByItemId, updateItem } from '../controllers/addItemsController.js';
import { processUpload } from '../utils/cloudinary.js';
import {restaurantAuth} from '../middlewares/restaurantAuth.js'
const router = express.Router();

router.post('/additem',restaurantAuth,processUpload,addItemToRestaurant)
router.put('/updateitem/:item_id',restaurantAuth,processUpload,updateItem)
router.get('/getallitemsuser/:_id', getItemsByRestaurant);
router.get('/getallitems',getItemsall);
router.post('/fetchresid',getRestaurantByItemId)
router.delete('/deleteitem/:item_id',restaurantAuth,deleteItemFromRestaurant)



export{router as itemsRoutes}