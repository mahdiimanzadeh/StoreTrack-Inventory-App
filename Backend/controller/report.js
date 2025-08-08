// Backend/controller/report.js
const Product = require("../models/product");
const Order = require("../models/order");
const Transaction = require("../models/transaction"); // برای گزارش خرید (نوع 'in')

// Get Low Stock Products Report
const getLowStockProducts = async (req, res) => {
  try {
    const { userID } = req.params;
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockProducts = await Product.find({
      userID: userID,
      stock: { $lte: threshold },
    }).sort({ stock: 1 });

    res.status(200).json(lowStockProducts);
  } catch (error) {
    console.error("Error getting low stock products report:", error);
    res.status(500).send("Error getting low stock products report");
  }
};

// Get Sales Report (based on Order model)
const getSalesReport = async (req, res) => {
  try {
    const { userID } = req.params;
    const { startDate, endDate } = req.query;

    let query = { userID: userID, status: 'shipped' }; // فقط سفارشات ارسال شده را به عنوان فروش در نظر می‌گیریم

    if (startDate) {
      query.orderDate = { ...query.orderDate, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.orderDate = { ...query.orderDate, $lte: new Date(endDate) };
    }

    const salesData = await Order.find(query)
      .populate('items.productID', 'name price')
      .sort({ orderDate: -1 });

    const totalSalesAmount = salesData.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      totalSalesAmount: totalSalesAmount,
      numberOfSales: salesData.length,
      salesDetails: salesData,
    });
  } catch (error) {
    console.error("Error getting sales report:", error);
    res.status(500).send("Error getting sales report");
  }
};

// Get Purchase Report (based on Transaction type 'in')
const getPurchaseReport = async (req, res) => {
  try {
    const { userID } = req.params;
    const { startDate, endDate } = req.query;

    let transactionQuery = { userID: userID, type: 'in' }; // فقط تراکنش‌های نوع 'in' را به عنوان خرید در نظر می‌گیریم
    if (startDate) {
      transactionQuery.transactionDate = { ...transactionQuery.transactionDate, $gte: new Date(startDate) };
    }
    if (endDate) {
      transactionQuery.transactionDate = { ...transactionQuery.transactionDate, $lte: new Date(endDate) };
    }
    const purchaseTransactions = await Transaction.find(transactionQuery)
      .populate('productID', 'name price')
      .sort({ transactionDate: -1 });

    // محاسبه مجموع مبلغ خرید از تراکنش‌ها
    // فرض می‌کنیم price در ProductSchema همیشه قیمت خرید است یا یک قیمت واحد برای محاسبه
    const totalPurchaseAmountFromTransactions = purchaseTransactions.reduce((sum, item) => {
        // اطمینان از وجود productID و price قبل از دسترسی
        const itemPrice = item.productID && item.productID.price ? item.productID.price : 0;
        return sum + (item.quantity * itemPrice);
    }, 0);


    res.status(200).json({
      totalPurchaseAmount: totalPurchaseAmountFromTransactions,
      numberOfPurchases: purchaseTransactions.length,
      purchaseDetails: purchaseTransactions,
    });

  } catch (error) {
    console.error("Error getting purchase report:", error);
    res.status(500).send("Error getting purchase report");
  }
};


module.exports = {
  getLowStockProducts,
  getSalesReport,
  getPurchaseReport,
};
