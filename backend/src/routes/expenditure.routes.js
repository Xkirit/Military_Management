const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditure.controller');
const { protect } = require('../middleware/auth.middleware');

// Create a new expenditure
router.post('/', protect, expenditureController.createExpenditure);

// Get all expenditures with optional filters
router.get('/', protect, expenditureController.getAllExpenditures);

// Get expenditure summary
router.get('/summary', protect, expenditureController.getExpenditureSummary);

// Get expenditure by ID
router.get('/:id', protect, expenditureController.getExpenditureById);

// Update expenditure
router.put('/:id', protect, expenditureController.updateExpenditure);

// Delete expenditure
router.delete('/:id', protect, expenditureController.deleteExpenditure);

// Update expenditure status
router.patch('/:id/status', protect, expenditureController.updateStatus);

module.exports = router; 