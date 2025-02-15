import express from "express";
import { createOrder, updateOrderStatus, getUserOrders, getRestaurantOrders, getDeliveryOrders } from "../controllers/orderController.js";
import {userAuth} from "../middlewares/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createOrder);
router.put("/update-status/:orderId", userAuth, updateOrderStatus);
router.get("/user-orders/:userId", userAuth, getUserOrders);
router.get("/restaurant-orders/:restaurantId", userAuth, getRestaurantOrders);
router.get("/delivery-orders", userAuth, getDeliveryOrders);

export{router as orderRoutes}
