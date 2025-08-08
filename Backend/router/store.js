// Backend/router/store.js
const express = require("express");
const router = express.Router(); // استفاده از express.Router() به جای app = express()
const storeController = require("../controller/store"); // کنترلر فروشگاه‌ها
const authMiddleware = require('../middleware/authMiddleware'); // میان‌افزار احراز هویت

// Add Store
router.post("/add", authMiddleware.protect, storeController.addStore);

// Get All Store
router.get("/get/:userID", authMiddleware.protect, storeController.getAllStores);

module.exports = router;
