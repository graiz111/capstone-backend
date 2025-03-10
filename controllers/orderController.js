import { ORDER } from "../models/orderModel.js";
import mongoose from 'mongoose';
import { DELIVERY } from '../models/deliverBoyModels.js'; 
import { ADDRESS } from "../models/addressModel.js";






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


export const getUserOrders = async (req, res) => {
  try {
    const orders = await ORDER.find({ user_id: req.params.userId }).populate("restaurant_id");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};

export const getRestaurantOrders = async (req, res) => {
  try {

    
    const { id } = req.restaurant;

    

   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID." });
    }

  
    const orders = await ORDER.find({ restaurant_id: id })
      .populate("user_id", "name email") // Populate user details
      .populate("items.item_id", "name price") // Populate item details
      .lean(); // Convert Mongoose documents to plain JavaScript objects

    // Check if orders exist
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this restaurant now." });
    }


    // Return the orders
    res.status(200).json({ success: true, message: "Orders fetched successfully.", data: orders });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};




export const getDeliveryassign = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session for transactions
  session.startTransaction();

  try {


    const { orderId } = req.body;

    // Validate orderId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid Order ID." });
    }



    const deliveryBoys = await DELIVERY.find({ 
      $and: [{ isDelivery: true }, { isActive: true }] 
    }).session(session);

    if (deliveryBoys.length === 0) {
      return res.status(404).json({ success: false, message: "No active delivery boys available." });
    }

    
    const randomIndex = Math.floor(Math.random() * deliveryBoys.length);
    const selectedDeliveryBoy = deliveryBoys[randomIndex];

  

    // Fetch the order
    const order = await ORDER.findById(orderId).session(session);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Check if the order is already assigned to a delivery boy
    if (order.deliveryBoyId) {
      return res.status(400).json({ success: false, message: "Order is already assigned to a delivery boy." });
    }

    // Assign the order to the selected delivery boy
    selectedDeliveryBoy.orders = selectedDeliveryBoy.orders || [];
    selectedDeliveryBoy.orders.push(orderId);
    await selectedDeliveryBoy.save({ session });

    
    order.status = "Out for Delivery"; 
    order.deliveryBoyId = selectedDeliveryBoy._id;
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();


    res.status(200).json({
      success: true,
      message: "Order assigned to delivery boy successfully.",
      data: {
        order,
        deliveryBoy: {
          _id: selectedDeliveryBoy._id,
          name: selectedDeliveryBoy.name,
        },
      },
    });
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error("Error in getDeliveryassign:", error);
    res.status(500).json({ success: false, message: "Error assigning delivery boy to order.", error: error.message });
  }
};
// export const getOrdersByDeliveryBoyId = async (req, res) => {
//   try {
    

//     const { delivery_id } = req.query; 
//     console.log(req.query,"query");
    

  
//     if (!delivery_id) {
//       return res.status(400).json({ success: false, message: "Delivery boy ID is required." });
//     }

  

 
//     const orders = await ORDER.find({ deliveryBoyId: delivery_id }) // Ensure the field name matches your schema
//       .populate({
//         path: 'user_id', // Populate the user_id field to get customer details
//         select: 'name phone', // Fetch the name and phone of the customer
//       })
//       .populate({
//         path: 'restaurant_id', // Populate the restaurant_id field to get restaurant details
//         select: 'name', // Fetch the name of the restaurant
//       });
      
//       if (!orders || orders.length === 0) {
//         return res.status(404).json({ success: false, message: "No orders found for you" });
//       }
      
//       console.log(orders,"orsers");
      
//       const userIds = orders.map(order => order.user_id);
//       console.log(userIds,"userid");
    
    
//     const addresses = await ADDRESS.find({ 
//       user_id: { $in: userIds }, 
//       is_default: true 
//     });

    
//     const addressMap = {};
//     addresses.forEach(addr => {
//       addressMap[addr.user_id.toString()] = addr;
//     });

    
//     const formattedOrders = orders.map(order => {
//       const userId = order.user_id._id.toString();
//       const userAddress = addressMap[userId];
      
//       // Format address
//       let formattedAddress = "Address not found";
//       if (userAddress) {
//         formattedAddress = `${userAddress.address_line_1}`;
//         if (userAddress.address_line_2) formattedAddress += `, ${userAddress.address_line_2}`;
//         formattedAddress += `, ${userAddress.city}, ${userAddress.state}, ${userAddress.postal_code}`;
//         formattedAddress += `, ${userAddress.country}`;
//       }

//       return {
//         orderId: order._id,
//         status: order.status,
//         paymentMethod: order.paymentMethod,
//         totalPrice: order.totalPrice,
//         customer: {
//           name: order.user_id.name,
//           phone: order.user_id.phone,
//           address: formattedAddress,
//           addressDetails: userAddress || null
//         },
//         restaurant: {
//           name: order.restaurant_id.name,
//         },
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully.",
//       data: formattedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders by delivery boy ID:", error);
//     res.status(500).json({ success: false, message: "Error fetching orders.", error: error.message });
//   }
// };


export const getOrdersByDeliveryBoyId = async (req, res) => {
  try {
    const { delivery_id } = req.query; 
    
    if (!delivery_id) {
      return res.status(400).json({ success: false, message: "Delivery boy ID is required." });
    }

    const orders = await ORDER.find({ deliveryBoyId: delivery_id })
      .populate({
        path: 'user_id',
        select: 'name phone',
      })
      .populate({
        path: 'restaurant_id',
        select: 'name',
      });
      console.log(orders,"orders");
      
      
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for you" });
    }
    
  
    const validUserOrders = orders.filter(order => order.user_id !== null);
    const userIds = validUserOrders.map(order => order.user_id._id);
;
    

    const addresses = userIds.length > 0 ? 
      await ADDRESS.find({ user_id: { $in: userIds }, is_default: true }) : [];

    const addressMap = {};
    addresses.forEach(addr => {
      addressMap[addr.user_id.toString()] = addr;
    });

  
    const formattedOrders = orders.map(order => {
    
      if (!order.user_id) {
        return {
          orderId: order._id,
          status: order.status,
          paymentMethod: order.paymentMethod,
          totalPrice: order.totalPrice,
          customer: {
       
            name: "error in server name fetch",
            phone: "contact app",
            address: order.address || "Address not available",
            addressDetails: null
          },
          restaurant: {
            name: order.restaurant_id ? order.restaurant_id.name : "Unknown Restaurant",
          },
        };
      }

      const userId = order.user_id._id.toString();
      const userAddress = addressMap[userId];
      

      let formattedAddress = order.address || "Address not found"; 
      if (userAddress) {
        formattedAddress = `${userAddress.address_line_1}`;
        if (userAddress.address_line_2) formattedAddress += `, ${userAddress.address_line_2}`;
        formattedAddress += `, ${userAddress.city}, ${userAddress.state}, ${userAddress.postal_code}`;
        formattedAddress += `, ${userAddress.country}`;
      }

      return {
        orderId: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
        customer: {
          name: order.user_id.name,
          phone: order.user_id.phone,
          address: formattedAddress,
          addressDetails: userAddress || null
        },
        restaurant: {
          name: order.restaurant_id ? order.restaurant_id.name : "Unknown Restaurant",
        },
      };
    });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders by delivery boy ID:", error);
    res.status(500).json({ success: false, message: "Error fetching orders.", error: error.message });
  }
};
export const orderCancel= async (req, res) => {
  const { order_id } = req.body;

  try {
    // Find the order by order_id
    const order = await ORDER.findById(order_id);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order is already canceled
    if (order.status === "Canceled") {
      return res.status(400).json({
        success: false,
        message: "Order is already canceled",
      });
    }

    // Update the order status to "canceled"
    order.status = "Canceled";
    await order.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};