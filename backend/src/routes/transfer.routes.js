const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');


router.post('/', protect, transferController.createTransfer);


router.get('/', protect, transferController.getAllTransfers);


router.get('/:id', protect, transferController.getTransferById);


router.put('/:id', protect, transferController.updateTransfer);


router.delete('/:id', protect, transferController.deleteTransfer);


router.patch('/:id/status', protect, transferController.updateStatus);

module.exports = router; 