// Backend/router/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transaction');
const authMiddleware = require('../middleware/authMiddleware');

// مسیر دریافت تمام تراکنش‌ها برای یک کاربر خاص (نیاز به احراز هویت)
router.get('/get/:userID', authMiddleware.protect, (req, res, next) => {
    console.log("Router: GET /api/transactions/get/:userID received.");
    console.log("Router: UserID from URL params:", req.params.userID);
    next(); // ادامه به کنترلر
}, transactionController.getAllTransactions);

// مسیر دریافت تراکنش‌های یک محصول خاص برای یک کاربر (نیاز به احراز هویت)
router.get('/getByProduct/:userID/:productID', authMiddleware.protect, (req, res, next) => {
    console.log("Router: GET /api/transactions/getByProduct/:userID/:productID received.");
    console.log("Router: UserID from URL params:", req.params.userID);
    console.log("Router: ProductID from URL params:", req.params.productID);
    next(); // ادامه به کنترلر
}, transactionController.getTransactionsByProduct);

// مسیر افزودن تراکنش دستی (نیاز به احراز هویت)
router.post('/addManual', authMiddleware.protect, (req, res, next) => {
    console.log("Router: POST /api/transactions/addManual received.");
    console.log("Router: Request body for addManual:", req.body);
    next(); // ادامه به کنترلر
}, transactionController.addManualTransaction);

module.exports = router;
