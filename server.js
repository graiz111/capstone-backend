import express from 'express';
import mongoose from 'mongoose';
import { mainRouter } from './routes/index.js';
import cookieParser from "cookie-parser";
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ DB connected successfully'))
  .catch(err => {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  });

// Routes
app.use('/api', mainRouter);

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// import express from 'express';
// import mongoose from 'mongoose';
// import { mainRouter } from './routes/index.js';
// import dotenv from 'dotenv';
// import cookieParser from "cookie-parser";
// import bodyParser from 'body-parser';
// import cors from 'cors'

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001; 
// const MONGO_URI = process.env.MONGO_URI;

// app.use(express.json())
// app.use(cookieParser())
// app.use(bodyParser.urlencoded({ extended: true })); 


// app.use(cors({
//   origin: " http://localhost:5173", 
//   credentials: true,            
// }));


// mongoose.connect(MONGO_URI)
//   .then(() => console.log('DB connected to server'))
//   .catch(err => console.error(err));



// app.use('/api', mainRouter);



// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
