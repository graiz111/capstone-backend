import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import { ORDER } from './models/orderModel.js'; 
import cors from 'cors';
import dotenv from 'dotenv';
import { mainRouter } from './routes/index.js';

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const server = http.createServer(app);
const FRONTURL=process.env.FRONTEND_URL;


// **Enable CORS for HTTP Requests**
app.use(cors({
  origin: FRONTURL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// **Enable JSON Middleware for API Requests**
app.use(express.json()); 

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: FRONTURL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
  },
});


// **Connect to MongoDB**
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ DB connected successfully'))
  .catch(err => {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    console.log('Origin:', socket.handshake.headers.origin);
  
    socket.on('updateOrderStatus', async (data) => {
      const { orderId, newStatus } = data;
      try {
        const updatedOrder = await ORDER.findByIdAndUpdate(
          orderId,
          { status: newStatus },
          { new: true }
        );
        io.emit('orderStatusUpdated', updatedOrder);
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

app.use('/api', mainRouter);

// **Test Route**
app.get("/", (req, res) => {
  res.send("Server is running");
});

// **Start the Server**
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

