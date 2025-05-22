const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');


router.get('/', inventoryController.getInventory);


router.get('/:product_id', inventoryController.getStockByProductId);


router.post('/', inventoryController.addStock);


router.put('/:product_id', inventoryController.updateStock);

module.exports = router;
