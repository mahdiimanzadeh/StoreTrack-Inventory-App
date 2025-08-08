// Backend/models/transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    type: { // نوع تراکنش: 'in' برای ورود کالا، 'out' برای خروج کالا
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    quantity: { // مقدار کالا در این تراکنش
      type: Number,
      required: true,
      min: 1,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    description: { // توضیحات اضافی (مثلاً "خرید از تامین‌کننده", "فروش به مشتری", "لغو سفارش")
      type: String,
      trim: true,
    },
    // اگر بخواهیم تراکنش را به یک سفارش خاص مرتبط کنیم
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: false, // اختیاری است، چون همه تراکنش‌ها لزوماً از سفارش نیستند
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transaction", TransactionSchema);
module.exports = Transaction;
