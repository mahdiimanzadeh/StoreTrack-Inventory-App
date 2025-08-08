// Backend/models/order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [ // آرایه‌ای از محصولات موجود در سفارش
      {
        productID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtOrder: { // قیمت محصول در زمان ثبت سفارش
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: { // مبلغ کل سفارش
      type: Number,
      required: true,
      min: 0,
    },
    status: { // وضعیت سفارش: در انتظار، ارسال شده، لغو شده
      type: String,
      enum: ["pending", "shipped", "cancelled"],
      default: "pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    // فیلدهای اختیاری دیگر مانند shippingAddress, customerInfo
    shippingAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", OrderSchema);
module.exports = Order;
