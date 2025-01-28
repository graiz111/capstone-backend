import  Razorpay from 'razorpay'
import dotenv from "dotenv";
dotenv.config();




const razorpay = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

app.post('/payment/create', async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    // Create payment order with Razorpay
    const payment_order = await razorpay.orders.create({
      amount: amount * 100,  // Amount is in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `order_${order_id}`,
    });

    res.status(200).json({ orderId: payment_order.id, currency: 'INR' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment order', error });
  }
});

app.post('/api/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    try {
      // Validate the payment signature
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', 'your_key_secret')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
  
      if (generatedSignature === razorpay_signature) {
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error verifying payment', error });
    }
  });
  
