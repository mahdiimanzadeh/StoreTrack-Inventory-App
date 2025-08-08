// Backend/controller/product.js
const Product = require("../models/product");
const Transaction = require("../models/transaction");
// Add Product
const addProduct = (req, res) => {
  console.log("req: ", req.body.userId);
  const { userId, name, manufacturer, description, price, category } = req.body;

  const newProduct = new Product({
    userID: userId,
    name: name,
    manufacturer: manufacturer,
    stock: 0, // موجودی اولیه همیشه 0 است و با تراکنش‌های 'in' افزایش می‌یابد
    description: description,
    price: price,
    category: category,
  });

  newProduct
    .save()
    .then(async (result) => {
      // ثبت تراکنش اولیه 'in' برای موجودی صفر
      const transaction = new Transaction({
        userID: result.userID,
        productID: result._id,
        type: 'in',
        quantity: 0,
        description: 'Initial product creation with 0 stock',
      });
      await transaction.save();

      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(402).send(err);
    });
};

// Get All Products
const getAllProducts = async (req, res) => {
  const findAllProducts = await Product.find({
    userID: req.params.userId,
  }).sort({ _id: -1 });
  res.json(findAllProducts);
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.deleteOne({ _id: req.params.id });
    // حذف تمام تراکنش‌های مرتبط با این محصول
    await Transaction.deleteMany({ productID: req.params.id });

    res.json({ deletedProduct, message: 'Product and related transactions deleted successfully' });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const { productID, name, manufacturer, description, price, category, stock } = req.body;

    const existingProduct = await Product.findById(productID);
    if (!existingProduct) {
      return res.status(404).send("Product not found.");
    }

    const oldStock = existingProduct.stock;
    const newStock = stock !== undefined ? stock : oldStock;
    const stockDifference = newStock - oldStock;

    const updatedResult = await Product.findByIdAndUpdate(
      { _id: productID },
      {
        name: name,
        manufacturer: manufacturer,
        description: description,
        price: price,
        category: category,
        stock: newStock,
      },
      { new: true }
    );

    if (stockDifference !== 0) {
      const transactionType = stockDifference > 0 ? 'in' : 'out';
      const transactionDescription = stockDifference > 0 ? 'Manual stock increase' : 'Manual stock decrease';

      const transaction = new Transaction({
        userID: updatedResult.userID,
        productID: updatedResult._id,
        type: transactionType,
        quantity: Math.abs(stockDifference),
        description: transactionDescription,
      });
      await transaction.save();
    }

    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error updating product");
  }
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};
