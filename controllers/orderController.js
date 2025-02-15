import { ORDER } from "../models/orderModel.js";

// 📌 Create a new order
export const createOrder = async (req, res) => {
  const { user_id, restaurant_id, items, totalPrice, address, paymentMethod } = req.body;

  try {
    const newOrder = new ORDER({ user_id, restaurant_id, items, totalPrice, address, paymentMethod });
    await newOrder.save();

    req.io.emit("orderStatusUpdated", { orderId: newOrder._id, status: newOrder.status });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
};

// 📌 Update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const userRole = req.user.role;

  try {
    let allowedUpdates = [];
    if (userRole === "restaurant") allowedUpdates = ["Preparing", "Out for Delivery"];
    if (userRole === "delivery") allowedUpdates = ["Delivered"];

    if (!allowedUpdates.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const updatedOrder = await ORDER.findByIdAndUpdate(orderId, { status }, { new: true });

    req.io.emit("orderStatusUpdated", { orderId, status });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

// 📌 Get orders for a specific user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await ORDER.find({ user_id: req.params.userId }).populate("restaurant_id");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};

// 📌 Get orders for a specific restaurant
export const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await ORDER.find({ restaurant_id: req.params.restaurantId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant orders", error });
  }
};

// 📌 Get orders assigned to delivery personnel
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await ORDER.find({ status: "Out for Delivery" }).populate("restaurant_id user_id");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery orders", error });
  }
};
