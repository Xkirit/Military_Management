const express = require('express');
const router = express.Router();
const { 
  getAllPurchases, 
  getAvailableEquipment, 
  getPurchaseById, 
  createPurchase, 
  updatePurchase, 
  updatePurchaseStatus, 
  deletePurchase, 
  approvePurchase 
} = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/rbac.middleware');

router.get('/available-equipment', protect, getAvailableEquipment);

router.route('/')
  .get(protect, getAllPurchases)
  .post(protect, checkPermission('create_purchase'), createPurchase);

router.route('/:id')
  .get(protect, getPurchaseById)
  .put(protect, checkPermission('update_own_purchase'), updatePurchase)
  .delete(protect, checkPermission('delete_own_purchase'), deletePurchase);

router.patch('/:id/status', updatePurchaseStatus);
router.patch('/:id/approve', protect, checkPermission('approve_purchase'), approvePurchase);

module.exports = router; 