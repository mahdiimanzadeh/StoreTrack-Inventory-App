const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0, // موجودی پیش‌فرض 0 باشد
    },
    description: String,
    // فیلدهای جدید اضافه شده:
    price: {
      type: Number,
      required: true,
      min: 0, // قیمت نمی‌تواند منفی باشد
    },
    category: {
      type: String,
      required: true, // دسته‌بندی الزامی است
      trim: true, // فاصله اضافی را حذف می‌کند
    },
  },
  { timestamps: true }
);


const Product = mongoose.model("product", ProductSchema);
module.exports = Product;
