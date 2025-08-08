// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // مدل کاربر

const protect = async (req, res, next) => {
  let token;

  // بررسی وجود توکن در هدر Authorization (فرمت: Bearer TOKEN)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // دریافت توکن از هدر
      token = req.headers.authorization.split(' ')[1];

      // تأیید توکن با استفاده از JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // پیدا کردن کاربر بر اساس شناسه (id) از توکن و اضافه کردن آن به شیء درخواست (req.user)
      req.user = await User.findById(decoded.id).select('-password'); // رمز عبور را برنگردان
      next(); // ادامه به تابع کنترلر بعدی
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'مجاز نیست، توکن نامعتبر است' });
    }
  }

  // اگر توکن وجود نداشت
  if (!token) {
    res.status(401).json({ message: 'مجاز نیست، توکن یافت نشد' });
  }
};

module.exports = { protect };
