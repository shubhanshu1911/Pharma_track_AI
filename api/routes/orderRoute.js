const express = require('express');
const router = express.Router();
const { placeOrder, updateOrderStatus , getSuppliersByProductId, getAllOrders,getOrderStatusById, deleteOrder} = require('../controllers/orderController');

router.post('/orders', placeOrder);

// Update status (delivered or cancelled)
router.put('/orders/:order_id/status', updateOrderStatus);

router.get('/suppliers/:product_id', getSuppliersByProductId);

// Route to get all orders
router.get('/orders', getAllOrders);

router.get('/order-status/:order_id', getOrderStatusById);

router.delete('/orders/:order_id', deleteOrder);

module.exports = router;
