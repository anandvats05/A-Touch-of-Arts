const Razorpay = require("razorpay");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();
const Routes = require("./routes/route.js");

const PORT = process.env.PORT || 5000;

// Load environment variables from .env file
dotenv.config();

// Initialize Razorpay instance using the correct keys from your .env
module.exports.instance = new Razorpay({
    key_id: process.env.REACT_APP_RAZORPAY_API_KEY,  // Correct key variable
    key_secret: process.env.REACT_APP_RAZORPAY_API_SECRET  // Correct secret key variable
});

// Middleware to handle JSON requests and CORS
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Connect to MongoDB using the URL from .env
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// Set up routes
app.use('/', Routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`);
});
