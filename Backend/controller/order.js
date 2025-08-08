// Backend/controller/order.js
const Order = require("../models/order");
const Product = require("../models/product");
const Transaction = require("../models/transaction");
const mongoose = require('mongoose');

// Add New Order
const addOrder = async (req, res) => {
  console.log("Controller: addOrder called. Request body:", req.body);
  try {
    const { userID, items, shippingAddress } = req.body;

    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      console.error("Controller: Invalid UserID provided in body:", userID);
      return res.status(400).json({ message: "شناسه کاربری نامعتبر است." });
    }

    let totalAmount = 0;
    const orderItemsDetails = [];

    for (const item of items) {
      if (!item.productID || !mongoose.Types.ObjectId.isValid(item.productID)) {
        console.error("Controller: Invalid ProductID in order item:", item.productID);
        return res.status(400).json({ message: `شناسه محصول ${item.productID} نامعتبر است.` });
      }

      const product = await Product.findById(item.productID);
      if (!product) {
        console.error("Controller: Product not found for order item:", item.productID);
        return res.status(404).json({ message: `کالا با شناسه ${item.productID} یافت نشد.` });
      }
      if (product.stock < item.quantity) {
        console.error("Controller: Insufficient stock for product:", product.name, "Current:", product.stock, "Requested:", item.quantity);
        return res.status(400).json({ message: `موجودی کافی برای ${product.name} وجود ندارد. موجودی فعلی: ${product.stock}` });
      }

      product.stock -= item.quantity;
      await product.save();
      console.log("Controller: Product stock decreased for product ID:", product._id, "New stock:", product.stock);

      const transaction = new Transaction({
        userID: userID,
        productID: product._id,
        type: 'out',
        quantity: item.quantity,
        description: `Sold as part of order ${new Date().toISOString()}`,
      });
      await transaction.save();
      console.log("Controller: Transaction saved for order item:", transaction._id);

      totalAmount += product.price * item.quantity;
      orderItemsDetails.push({
        productID: item.productID,
        quantity: item.quantity,
        priceAtOrder: product.price,
      });
    }

    const newOrder = new Order({
      userID: userID,
      items: orderItemsDetails,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      status: 'pending',
    });

    const result = await newOrder.save();
    console.log("Controller: New order saved with ID:", result._id);
    res.status(200).send(result);
  } catch (err) {
    console.error("Controller: Error adding order:", err);
    res.status(500).send("خطا در ایجاد سفارش.");
  }
};

// Get All Orders for a User
const getAllOrders = async (req, res) => {
  console.log("Controller: getAllOrders called for UserID:", req.params.userID);
  try {
    const { userID } = req.params;

    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
        console.error("Controller: Invalid UserID provided:", userID);
        return res.status(400).json({ message: "شناسه کاربری نامعتبر است." });
    }

    const findAllOrders = await Order.find({ userID: userID })
      .sort({ _id: -1 })
      .populate('items.productID', 'name price category'); // جزئیات محصول را populate می‌کند

    console.log("Controller: Found orders for UserID", userID, ":", findAllOrders.length);
    res.json(findAllOrders);
  } catch (error) {
    console.error("Controller: Error in getAllOrders for UserID", req.params.userID, ":", error);
    res.status(500).send("خطا در دریافت سفارشات.");
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  console.log("Controller: updateOrderStatus called for OrderID:", req.params.orderID, " New Status:", req.body.status);
  try {
    const { orderID } = req.params;
    const { status } = req.body;

    if (!orderID || !mongoose.Types.ObjectId.isValid(orderID)) {
      console.error("Controller: Invalid OrderID provided:", orderID);
      return res.status(400).json({ message: "شناسه سفارش نامعتبر است." });
    }

    const order = await Order.findById(orderID);
    if (!order) {
      console.error("Controller: Order not found for update:", orderID);
      return res.status(404).json({ message: "Order not found." });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productID);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          console.log("Controller: Product stock increased due to cancellation for product ID:", product._id);

          const transaction = new Transaction({
            userID: order.userID,
            productID: product._id,
            type: 'in',
            quantity: item.quantity,
            description: `Stock returned due to cancelled order ${orderID}`,
            orderID: order._id,
          });
          await transaction.save();
          console.log("Controller: Cancellation transaction saved:", transaction._id);
        }
      }
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    console.log("Controller: Order status updated to:", updatedOrder.status, " for Order ID:", updatedOrder._id);
    res.status(200).send(updatedOrder);
  } catch (error) {
    console.error("Controller: Error updating order status for OrderID", req.params.orderID, ":", error);
    res.status(500).send("خطا در به‌روزرسانی وضعیت سفارش.");
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  console.log("Controller: deleteOrder called for OrderID:", req.params.orderID);
  try {
    const { orderID } = req.params;

    if (!orderID || !mongoose.Types.ObjectId.isValid(orderID)) {
      console.error("Controller: Invalid OrderID provided:", orderID);
      return res.status(400).json({ message: "شناسه سفارش نامعتبر است." });
    }

    const deletedOrder = await Order.findByIdAndDelete(orderID);

    if (!deletedOrder) {
      console.error("Controller: Order not found for deletion:", orderID);
      return res.status(404).json({ message: "Order not found." });
    }
    
    await Transaction.deleteMany({ orderID: orderID });
    console.log("Controller: Related transactions deleted for Order ID:", orderID);

    res.status(200).json({ message: "سفارش با موفقیت حذف شد." });
  } catch (error) {
    console.error("Controller: Error deleting order for OrderID", req.params.orderID, ":", error);
    res.status(500).send("خطا در حذف سفارش.");
  }
};


module.exports = {
  addOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
