import express from 'express';
import { addItemToRestaurant, deleteItemFromRestaurant, getItemsByRestaurant, updateItem } from '../controllers/addItemsController.js';
import { processUpload } from '../utils/cloudinary.js';
const router = express.Router();

router.post('/additems',processUpload,addItemToRestaurant)
router.put('/edititem',processUpload,updateItem)
router.get('/getallitems',getItemsByRestaurant)
router.get('/deleteitem',deleteItemFromRestaurant)



export{router as itemsRoutes}