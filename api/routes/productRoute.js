const express = require('express');
const router = express.Router();
const { getProductIDByName, searchProducts, getProductByID } = require('../controllers/productController');

// Route to get product ID by name
router.post('/product-id', getProductIDByName);

// Route to search products by query string
router.get('/products', searchProducts);

// Route for getting a product by ID
router.get('/products/:product_id', getProductByID);

module.exports = router;
