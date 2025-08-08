// Backend/router/authRoutes.js
const express = require('express');
const router = express.Router(); // استفاده از express.Router()
const authController = require('../controller/authController'); // کنترلر احراز هویت

// مسیر ثبت نام کاربر جدید
router.post('/register', authController.registerUser);

// مسیر ورود کاربر
router.post('/login', authController.loginUser);

module.exports = router;
