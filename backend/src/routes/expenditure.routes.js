const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditure.controller');
const { protect } = require('../middleware/auth.middleware');


router.post('/', protect, expenditureController.createExpenditure);


router.get('/', protect, expenditureController.getAllExpenditures);


router.get('/summary', protect, expenditureController.getExpenditureSummary);


router.get('/:id', protect, expenditureController.getExpenditureById);


router.put('/:id', protect, expenditureController.updateExpenditure);


router.delete('/:id', protect, expenditureController.deleteExpenditure);

module.exports = router; 