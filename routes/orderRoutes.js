import express from "express";
import { createOrder, updateOrderStatus, getUserOrders, getRestaurantOrders,  getDeliveryassign, getOrdersByDeliveryBoyId } from "../controllers/orderController.js";
import {userAuth} from "../middlewares/userAuth.js";
import { deliveryBoyAuth } from "../middlewares/deliveryBoyAuth.js";
import { restaurantAuth } from "../middlewares/restaurantAuth.js";

const router = express.Router();

router.post("/create", userAuth, createOrder);
router.put("/update-status/:orderId", userAuth, updateOrderStatus);
router.get("/user-orders/:userId", userAuth, getUserOrders);
router.get("/restaurant-orders/:restaurantId", userAuth, getRestaurantOrders);
router.get("/delivery-orders", deliveryBoyAuth,getOrdersByDeliveryBoyId);
router.put("/assign-delivery", restaurantAuth, getDeliveryassign);

export{router as orderRoutes}
