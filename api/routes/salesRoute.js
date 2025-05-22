const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.post('/', salesController.addSale);

router.get('/', salesController.getAllSales);

router.get('/:sale_id', salesController.getSaleById);

router.delete('/delete/:sale_id',salesController.deleteSale);

router.get('/ROP/:product_id', salesController.checkROPStatus);

router.get('/below-rop', salesController.getProductsBelowROP);
module.exports = router;
