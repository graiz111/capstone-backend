import express from "express";

import {userAuth} from "../middlewares/userAuth.js";
import { addItemToCart, clearCart, getUserCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.put("/update/:itemId", userAuth,updateCartItem);
router.delete("/delete/:cartItemId", userAuth,removeCartItem);
router.post('/additemtocart',userAuth,addItemToCart)
router.get('/cart/:userId', userAuth, getUserCart);
router.delete('/clearcart/:userId', userAuth,clearCart);

export{router as cartRoutes}