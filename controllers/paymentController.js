import Stripe from 'stripe';
import { ORDER } from '../models/orderModel.js';
import dotenv from "dotenv";
dotenv.config(); // Adjust the path to your Order model

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    console.log("entered pay co");
  
    try {
      const { userId, cartId, addressId, amount, items } = req.body;
      console.log(req.body);
  
      const lineItems = items.map((item) => {
        // Validate item and item.price
        if (!item?.item || typeof item.item.price !== "number") {
          throw new Error(`Invalid price for item: ${item.item?._id}`);
        }
  
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.item.name, // ✅ Correct property access
              images: [item.item.itemPic], // ✅ Correct property access
            },
            unit_amount: Math.round(item.item.price * 100), // ✅ Correct property access
          },
          quantity: item.quantity,
        };
      });
  
      console.log("Line Items:", lineItems); // Log the line items
      console.log("Creating Stripe session...");
  
      // Create Stripe checkout session
      try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `https://entri-main-project-frontend.vercel.app/user/${userId}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://entri-main-project-frontend.vercel.app/user/payment/cancel`,
          
        });
  
        console.log("Stripe Session:", session); // Log the Stripe session
  
        const newOrder = new ORDER({
          user_id: userId,
          restaurant_id: items[0]?.item?.restaurant_id, // ✅ Correct property access
          items: items.map((item) => ({
            item_id: item.item._id, // ✅ Correct property access
            quantity: item.quantity,
            price: item.item.price, // ✅ Correct property access
          })),
          totalPrice: amount,
          status: "Placed",
          address: addressId,
          paymentMethod: "Online",
          sessionId: session.id,
        });
  
        await newOrder.save();
  
        res.json({ success: true, sessionId: session.id });
      } catch (stripeError) {
        console.error("Stripe API Error:", stripeError);
        return res.status(500).json({ message: stripeError.message || "Stripe API error" });
      }
    } catch (error) {
      console.error("Error in createCheckoutSession:", error);
      return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
  };


  export const sessionrest = async (req, res) => {
    try {
      const { session_id } = req.query;
  
      // Validate session_id
      if (!session_id) {
        return res.status(400).json({ success: false, message: "Session ID is required" });
      }
  
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
  
      // Check if the payment was successful
      if (session.payment_status === "paid") {
        return res.status(200).json({ success: true, session_data: session });
      } else {
        return res.status(400).json({ success: false, message: "Payment not completed" });
      }
    } catch (error) {
      console.error("Error verifying payment session:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };