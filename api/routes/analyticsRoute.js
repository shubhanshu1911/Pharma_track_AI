const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');


router.get('/sales-by-product/:product_id', analyticsController.getSalesByProduct);


router.get('/stock-alerts', analyticsController.getStockAlerts);


router.get('/revenue', analyticsController.getRevenue);//sales by month

router.get('/sales-by-year/:year', analyticsController.getSalesByYear);

router.get('/pending-orders-count', analyticsController.getPendingOrderCount);

router.get('/getName', analyticsController.getName);

module.exports = router;


