const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Route to add a new customer request
router.post('/add-request', requestController.addRequest);

// Route to get all customer requests
router.get('/requests', requestController.getAllRequests);

module.exports = router;
