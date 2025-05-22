const express = require('express');
const router = express.Router();
const { getDemandData, getSupplierScoreData } = require('../controllers/predictController');

// Route to get demand data
router.get('/demand', getDemandData);

// Route to get supplier score data
router.get('/supplier-score', getSupplierScoreData);

module.exports = router;
