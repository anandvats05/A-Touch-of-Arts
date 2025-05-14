import express from "express";
import dotenv from "dotenv";
import paymentRoute from "./routes/paymentRoutes.js";
import cors from "cors";
import Razorpay from "razorpay";

// Initialize express app
const app = express();

// Load environment variables from .env file
dotenv.config();

// Log the environment variables to check if they are loaded correctly
console.log("Razorpay API Key:", process.env.REACT_APP_RAZORPAY_API_KEY);
console.log("Razorpay API Secret:", process.env.REACT_APP_RAZORPAY_API_SECRET);

// Initialize Razorpay instance using the key and secret from your .env file
const razorpayInstance = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_API_KEY,
  key_secret: process.env.REACT_APP_RAZORPAY_API_SECRET,
});

// CORS configuration to allow requests from your frontend
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:3000', // Update with the frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Important for passing cookies and credentials
};

app.use(cors(corsOptions)); // Ensure that CORS is applied globally

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payment route
app.use("/api", paymentRoute);

// Route to check Razorpay API key
app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.REACT_APP_RAZORPAY_API_KEY })
);

// Route to check Razorpay instance (for testing purposes)
app.get("/api/razorpay", (req, res) => {
  // Example test call to Razorpay API
  razorpayInstance.payouts
    .create({
      // You can replace this with an actual call to Razorpay with valid parameters
      account_number: 'example-account-number',
      amount: 100,
      currency: 'INR',
    })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Export the app to use it in the server file
export { app };
