const Transfer = require('../models/transfer.model');
const mongoose = require('mongoose');

// Create a new transfer
exports.createTransfer = async (req, res) => {
  try {
    const transfer = new Transfer({
      ...req.body,
      requestedBy: req.user._id // From auth middleware
    });
    
    const savedTransfer = await transfer.save();
    res.status(201).json(savedTransfer);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating transfer',
      error: error.message
    });
  }
};

// Get all transfers
exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('requestedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching transfers',
      error: error.message
    });
  }
};

// Get transfer by ID
exports.getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('requestedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank');
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    res.status(200).json(transfer);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching transfer',
      error: error.message
    });
  }
};

// Update transfer
exports.updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Only allow updates if transfer is not completed
    if (transfer.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot update completed transfer' });
    }

    const updatedTransfer = await Transfer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTransfer);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating transfer',
      error: error.message
    });
  }
};

// Delete transfer
exports.deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Only allow deletion if transfer is pending
    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only delete pending transfers' });
    }

    await Transfer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting transfer',
      error: error.message
    });
  }
};

// Update transfer status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Pending': ['In Transit', 'Cancelled'],
      'In Transit': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };

    if (!validTransitions[transfer.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${transfer.status} to ${status}` 
      });
    }

    transfer.status = status;
    if (status === 'Completed') {
      transfer.actualDate = Date.now();
      transfer.approvedBy = req.user._id;
    }

    await transfer.save();
    res.status(200).json(transfer);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating transfer status',
      error: error.message
    });
  }
}; 