const express = require('express');
const { executeLLMQuery } = require('../controllers/queryController');

const router = express.Router();

// POST route to process LLM query and execute SQL
router.post('/', executeLLMQuery);

module.exports = router;
//This is the LLM route do not touch this file now