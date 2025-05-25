const Purchase = require('../models/purchase.model');

exports.getAllPurchases = async (req, res) => {
  try {
    const { category, status, startDate, endDate } = req.query;
    const filter = {};

    
    if (req.user.role === 'Admin') {
      
    } else {
      
      const baseUserIds = await require('../models/user.model').find({ base: req.user.base }).select('_id');
      filter.requestedBy = { $in: baseUserIds.map(user => user._id) };
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }


    const purchases = await Purchase.find(filter)
      .populate('requestedBy', 'firstName lastName department base')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getAvailableEquipment = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = {
      status: 'Delivered',
      $expr: { $gt: ['$quantityAvailable', 0] }
    };
    
    if (category) {
      query.category = category;
    }

    const availableEquipment = await Purchase.find(query)
      .select('item category quantityAvailable unitPrice supplier')
      .sort({ item: 1 });

    res.json(availableEquipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('requestedBy', 'firstName lastName department')
      .populate('approvedBy', 'firstName lastName');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase({
      ...req.body,
      requestedBy: req.user._id
    });

    await purchase.save();
    await purchase.populate('requestedBy', 'firstName lastName department');

    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.requestedBy.toString() !== req.user._id.toString() && !['Admin', 'Base Commander'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this purchase' });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['requestedBy', 'approvedBy']);

    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ message: 'Update error', error: error.message });
  }
};


exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    purchase.status = status;
    purchase.updatedAt = Date.now();

    
    if (status === 'Delivered' && !purchase.quantityAvailable) {
      purchase.quantityAvailable = purchase.quantity;
    }

    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.requestedBy.toString() !== req.user._id.toString() && !['Admin', 'Base Commander'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this purchase' });
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approvePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (!['Admin', 'Base Commander'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to approve purchases' });
    }

    purchase.status = 'Approved';
    purchase.approvedBy = req.user._id;
    purchase.updatedAt = Date.now();

    await purchase.save();
    await purchase.populate(['requestedBy', 'approvedBy']);

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllPurchases: exports.getAllPurchases,
  getAvailableEquipment: exports.getAvailableEquipment,
  getPurchaseById: exports.getPurchaseById,
  createPurchase: exports.createPurchase,
  updatePurchase: exports.updatePurchase,
  updatePurchaseStatus: exports.updatePurchaseStatus,
  deletePurchase: exports.deletePurchase,
  approvePurchase: exports.approvePurchase
}; 