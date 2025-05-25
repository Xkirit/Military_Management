const Transfer = require('../models/transfer.model');
const mongoose = require('mongoose');


exports.createTransfer = async (req, res) => {
  try {
    const transfer = new Transfer({
      ...req.body,
      requestedBy: req.user._id 
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


exports.getAllTransfers = async (req, res) => {
  try {
    const userBase = req.user.base; 
    const userRole = req.user.role;
    
    
    let baseTransferQuery;
    
    if (userRole === 'Admin') {
      
      baseTransferQuery = {}; 
    } else {
      
      baseTransferQuery = {
        $or: [
          { sourceBaseId: userBase },      
          { destinationBaseId: userBase }  
        ]
      };
    }
    
    const transfers = await Transfer.find(baseTransferQuery)
      .populate('requestedBy', 'firstName lastName role base')
      .populate('approvedBy', 'firstName lastName role base')
      .sort({ createdAt: -1 });
    
    
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching transfers',
      error: error.message
    });
  }
};


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


exports.updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    
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


exports.deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    
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


exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    
    if (transfer.status === 'Completed' && status !== 'Completed') {
      return res.status(400).json({ 
        message: 'Cannot change status of completed transfer' 
      });
    }

    
    const allowedStatuses = ['Pending', 'In Transit', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status: ${status}. Allowed statuses: ${allowedStatuses.join(', ')}` 
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