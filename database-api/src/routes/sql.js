const express = require('express');
const sqlController = require('../controllers/sql');

const router = express.Router();

/**
 * @route POST /sql/query
 * @description Execute a SQL query
 */
router.post('/query', sqlController.executeQuery);

/**
 * @route POST /sql/transaction
 * @description Execute a transaction with multiple SQL statements
 */
router.post('/transaction', sqlController.executeTransaction);

module.exports = router; 