// Backend/router/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controller/order');
const authMiddleware = require('../middleware/authMiddleware');

// مسیر افزودن سفارش جدید
router.post('/add', authMiddleware.protect, (req, res, next) => {
    console.log("Router: POST /api/orders/add received.");
    console.log("Router: Request body for addOrder:", req.body);
    next();
}, orderController.addOrder);

// مسیر دریافت تمام سفارشات برای یک کاربر خاص
router.get('/get/:userID', authMiddleware.protect, (req, res, next) => {
    console.log("Router: GET /api/orders/get/:userID received.");
    console.log("Router: UserID from URL params:", req.params.userID);
    next();
}, orderController.getAllOrders);

// مسیر به‌روزرسانی وضعیت سفارش
router.put('/updateStatus/:orderID', authMiddleware.protect, (req, res, next) => {
    console.log("Router: PUT /api/orders/updateStatus/:orderID received.");
    console.log("Router: OrderID from URL params:", req.params.orderID);
    console.log("Router: Request body for updateStatus:", req.body);
    next();
}, orderController.updateOrderStatus);

// مسیر حذف سفارش
router.delete('/delete/:orderID', authMiddleware.protect, (req, res, next) => {
    console.log("Router: DELETE /api/orders/delete/:orderID received.");
    console.log("Router: OrderID from URL params:", req.params.orderID);
    next();
}, orderController.deleteOrder);

module.exports = router;
