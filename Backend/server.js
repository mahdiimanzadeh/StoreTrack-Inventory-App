// Backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Import dotenv for environment variables
const cors = require("cors"); // Import cors middleware
const jwt = require("jsonwebtoken"); // For JWT operations in auth (though authController handles most)
const bcrypt = require("bcryptjs"); // For password hashing in auth (if not already in authController)
const alertController = require('./controller/alert'); // ایمپورت کنترلر alert

// Load environment variables from .env file
dotenv.config();

// Import database connection function (main from models/index.js)
const { main: connectDB } = require("./models/index"); // Renamed 'main' to 'connectDB' for clarity

// شروع زمان‌بندی بررسی موجودی پایین
alertController.scheduleLowStockCheck(); // <<--- این خط را اضافه کنید
console.log('Low stock check scheduled.');

// Import models (ensure they are loaded by Mongoose)
require("./models/users");
require("./models/product");
require("./models/order"); // New Order model
require("./models/transaction"); // New Transaction model
require("./models/store");

// Import controllers
const authController = require("./controller/authController"); // Assuming you have an authController
// The other controllers (product, purchase, sales, store) are imported via their routes

// Import routes
const authRoutes = require("./router/authRoutes"); // New auth routes
const productRoutes = require("./router/product"); // Existing product routes
const orderRoutes = require("./router/orderRoutes"); // New order routes
const transactionRoutes = require("./router/transactionRoutes"); // New transaction routes
const storeRoutes = require("./router/store"); // Existing store routes
const reportRoutes = require("./router/reportRoutes"); // New report routes

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000

// Connect to MongoDB
connectDB(); // Call the database connection function

// Middleware
app.use(express.json()); // For parsing application/json bodies
app.use(cors()); // Enable CORS for all origins (for development)

// --- API Routes ---
// Authentication API (Register/Login)
app.use("/api/auth", authRoutes); // Use the dedicated authRoutes

// Store API
app.use("/api/store", storeRoutes);

// Products API
app.use("/api/product", productRoutes);

// Orders API
app.use("/api/orders", orderRoutes); // Use the new order routes

// Transactions API
app.use("/api/transactions", transactionRoutes); // Use the new transaction routes

// Reports API
app.use("/api/reports", reportRoutes); // Use the new report routes

// --- Removed old direct login/register logic and test routes ---
// The login and register logic is now handled by authController and authRoutes
// The /api/login GET and /testget routes are removed as they are no longer needed
// after implementing proper authentication flow via authController.

// Basic Test Route
app.get("/", (req, res) => {
  res.send("Inventory Management API is running!");
});

// Here we are listening to the server
app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});

