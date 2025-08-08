// Backend/router/product.js
const express = require("express");
const router = express.Router(); // استفاده از express.Router() به جای app = express()
const productController = require("../controller/product"); // کنترلر محصولات
const authMiddleware = require('../middleware/authMiddleware'); // میان‌افزار احراز هویت

// Add Product
router.post("/add", authMiddleware.protect, productController.addProduct);

// Get All Products
router.get("/get/:userId", authMiddleware.protect, productController.getAllProducts);

// Delete Selected Product Item
// تغییر متد از GET به DELETE برای عملیات حذف
router.delete("/delete/:id", authMiddleware.protect, productController.deleteSelectedProduct);

// Update Selected Product
// تغییر متد از POST به PUT برای عملیات به‌روزرسانی
router.put("/update", authMiddleware.protect, productController.updateSelectedProduct);

// Search Product
router.get("/search", authMiddleware.protect, productController.searchProduct);

module.exports = router;
