// Backend/router/reportRoutes.js
const express = require('express');
const router = express.Router(); // استفاده از express.Router()
const reportController = require('../controller/report'); // کنترلر جدید Report
const authMiddleware = require('../middleware/authMiddleware'); // میان‌افزار احراز هویت

// مسیر دریافت گزارش کالاهای کم‌موجودی (نیاز به احراز هویت)
router.get('/lowStock/:userID', authMiddleware.protect, reportController.getLowStockProducts);

// مسیر دریافت گزارش فروش (نیاز به احراز هویت)
router.get('/sales/:userID', authMiddleware.protect, reportController.getSalesReport);

// مسیر دریافت گزارش خرید (نیاز به احراز هویت)
router.get('/purchases/:userID', authMiddleware.protect, reportController.getPurchaseReport);

module.exports = router;
