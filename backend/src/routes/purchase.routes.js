const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  approvePurchase
} = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');

// Purchase routes
router.route('/')
  .get(protect, getPurchases)
  .post(protect, createPurchase);

router.route('/:id')
  .get(protect, getPurchaseById)
  .put(protect, updatePurchase)
  .delete(protect, deletePurchase);

router.put('/:id/approve', protect, approvePurchase);

module.exports = router; 