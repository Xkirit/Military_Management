const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');

// Create a new transfer
router.post('/', protect, transferController.createTransfer);

// Get all transfers
router.get('/', protect, transferController.getAllTransfers);

// Get transfer by ID
router.get('/:id', protect, transferController.getTransferById);

// Update transfer
router.put('/:id', protect, transferController.updateTransfer);

// Delete transfer
router.delete('/:id', protect, transferController.deleteTransfer);

// Update transfer status
router.patch('/:id/status', protect, transferController.updateStatus);

module.exports = router; 