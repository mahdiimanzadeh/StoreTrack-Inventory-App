// Backend/controller/transaction.js
const Transaction = require("../models/transaction");
const Product = require("../models/product");
const mongoose = require('mongoose');

// Get All Transactions for a User
const getAllTransactions = async (req, res) => {
  console.log("Controller: getAllTransactions called for UserID:", req.params.userID);
  try {
    const { userID } = req.params;
    
    // اطمینان از اینکه userID معتبر است
    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
        console.error("Controller: Invalid UserID provided:", userID);
        return res.status(400).json({ message: "شناسه کاربری نامعتبر است." });
    }

    const findAllTransactions = await Transaction.find({ userID: userID })
      .sort({ transactionDate: -1 })
      .populate('productID', 'name category price'); // Populate product details

    console.log("Controller: Found transactions for UserID", userID, ":", findAllTransactions.length);
    res.json(findAllTransactions);
  } catch (error) {
    console.error("Controller: Error in getAllTransactions for UserID", req.params.userID, ":", error);
    res.status(500).send("خطا در دریافت تاریخچه تراکنش‌ها.");
  }
};

// Get Transactions by Product ID
const getTransactionsByProduct = async (req, res) => {
  console.log("Controller: getTransactionsByProduct called for UserID:", req.params.userID, " ProductID:", req.params.productID);
  try {
    const { productID, userID } = req.params;

    // اطمینان از اینکه شناسه‌ها معتبر هستند
    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
        console.error("Controller: Invalid UserID provided:", userID);
        return res.status(400).json({ message: "شناسه کاربری نامعتبر است." });
    }
    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        console.error("Controller: Invalid ProductID provided:", productID);
        return res.status(400).json({ message: "شناسه محصول نامعتبر است." });
    }

    const findProductTransactions = await Transaction.find({ productID: productID, userID: userID })
      .sort({ transactionDate: -1 })
      .populate('productID', 'name category price');

    console.log("Controller: Found product-specific transactions for UserID", userID, " ProductID", productID, ":", findProductTransactions.length);
    res.json(findProductTransactions);
  } catch (error) {
    console.error("Controller: Error in getTransactionsByProduct for UserID", req.params.userID, " ProductID", req.params.productID, ":", error);
    res.status(500).send("خطا در دریافت تراکنش‌های کالا.");
  }
};

// Add Manual Transaction
const addManualTransaction = async (req, res) => {
  console.log("Controller: addManualTransaction called. Request body:", req.body);
  try {
    const { userID, productID, type, quantity, description } = req.body;

    // اطمینان از اینکه userID و productID معتبر هستند
    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
        console.error("Controller: Invalid UserID provided in body:", userID);
        return res.status(400).json({ message: "شناسه کاربری نامعتبر است." });
    }
    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        console.error("Controller: Invalid ProductID provided in body:", productID);
        return res.status(400).json({ message: "شناسه محصول نامعتبر است." });
    }

    const product = await Product.findById(productID);
    if (!product) {
      console.error("Controller: Product not found for manual transaction:", productID);
      return res.status(404).json({ message: "Product not found." });
    }

    if (type === 'in') {
      product.stock += quantity;
    } else if (type === 'out') {
      if (product.stock < quantity) {
        console.error("Controller: Insufficient stock for manual transaction:", product.name, "Current:", product.stock, "Requested:", quantity);
        return res.status(400).json({ message: `موجودی کافی برای ${product.name} وجود ندارد. موجودی فعلی: ${product.stock}` });
      }
      product.stock -= quantity;
    } else {
      console.error("Controller: Invalid transaction type:", type);
      return res.status(400).json({ message: "نوع تراکنش نامعتبر است. باید 'in' یا 'out' باشد." });
    }
    await product.save();
    console.log("Controller: Product stock updated for product ID:", product._id, "New stock:", product.stock);

    const newTransaction = new Transaction({
      userID,
      productID,
      type,
      quantity,
      description,
    });

    const result = await newTransaction.save();
    console.log("Controller: New transaction saved with ID:", result._id);
    res.status(200).send(result);
  } catch (err) {
    console.error("Controller: Error adding manual transaction:", err);
    res.status(500).send("خطا در افزودن تراکنش دستی.");
  }
};

module.exports = {
  getAllTransactions,
  getTransactionsByProduct,
  addManualTransaction,
};
