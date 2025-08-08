// Backend/controller/alert.js
const Product = require("../models/product");
// const nodemailer = require('nodemailer'); // If you want to send emails (needs installation)
const cron = require('node-cron'); // For scheduling tasks (needs installation)

// Main function to check low stock and prepare alerts
const checkLowStockAndSendAlert = async (threshold = 10) => {
  try {
    // Finds products with stock less than or equal to the threshold
    const lowStockProducts = await Product.find({ stock: { $lte: threshold } });

    if (lowStockProducts.length > 0) {
      console.log(`Alert: Found ${lowStockProducts.length} products with low stock!`);
      // Here, the actual alert sending logic is implemented.
      // This section can include:
      // 1. Sending an email to the manager/warehouse responsible using nodemailer
      // 2. Sending a notification inside the app (e.g., to the frontend)
      // 3. Logging these alerts in a separate collection in the database for alert history
      lowStockProducts.forEach(product => {
        console.log(`- Product: ${product.name}, Stock: ${product.stock}, Category: ${product.category}`);
        // Example: Sending email (requires nodemailer configuration)
        // sendEmailAlert(product.name, product.stock, product.userID);
      });
      return lowStockProducts; // Returns the list of low stock products
    } else {
      console.log("No low stock products found.");
      return [];
    }
  } catch (error) {
    console.error("Error checking low stock for alerts:", error);
    return [];
  }
};

// An API Endpoint for manual testing or displaying low stock alerts in the frontend
const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const alerts = await checkLowStockAndSendAlert(threshold); // Calls the main function
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).send("Error retrieving low stock alerts.");
  }
};

// Function to set up alert scheduling
// This section should be placed in server.js or a separate setup file
const scheduleLowStockCheck = () => {
  // Runs every day at 9 AM (0 9 * * *)
  // For testing, you can change it to a shorter interval, e.g., every 5 minutes: '*/5 * * * *'
  cron.schedule('*/30 * * * * *', () => { 
    console.log('Running scheduled low stock check...');
    checkLowStockAndSendAlert(); // Calls the check function
  });
};


module.exports = {
  getLowStockAlerts,
  checkLowStockAndSendAlert, // This is the main function containing the alert logic
  scheduleLowStockCheck, // Now this function is exported
};
