const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getAvailableEquipment,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  updatePurchaseStatus,
  deletePurchase,
  approvePurchase
} = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes
router.use(protect);

// Purchase routes
router.get('/', getPurchases);
router.get('/available-equipment', getAvailableEquipment);
router.get('/:id', getPurchaseById);
router.post('/', createPurchase);
router.put('/:id', updatePurchase);
router.patch('/:id/status', updatePurchaseStatus);
router.delete('/:id', deletePurchase);
router.patch('/:id/approve', approvePurchase);

module.exports = router; 