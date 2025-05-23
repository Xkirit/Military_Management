const Purchase = require('../models/purchase.model');

// Get all purchases
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('requestedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank')
      .sort('-createdAt');
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available equipment for assignment
const getAvailableEquipment = async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    
    // Build query for delivered purchases with available quantity
    const query = {
      status: 'Delivered',
      quantityAvailable: { $gt: 0 }
    };
    
    if (search) {
      query.$or = [
        { item: { $regex: search, $options: 'i' } },
        { specifications: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    console.log('Available equipment query:', query);
    
    const equipment = await Purchase.find(query)
      .select('item category quantity quantityAvailable supplier specifications unitPrice createdAt')
      .sort({ item: 1 })
      .limit(50);
    
    console.log(`Found ${equipment.length} available equipment items`);
    
    res.json(equipment);
  } catch (error) {
    console.error('Get available equipment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('requestedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new purchase
const createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.create({
      ...req.body,
      requestedBy: req.user._id
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update purchase
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Only allow updates by the requester or an admin
    if (purchase.requestedBy.toString() !== req.user._id.toString() && req.user.rank !== 'General') {
      return res.status(403).json({ message: 'Not authorized to update this purchase' });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update purchase status
const updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    purchase.status = status;
    purchase.updatedAt = Date.now();

    // If status is being set to Delivered, initialize quantityAvailable
    if (status === 'Delivered' && !purchase.quantityAvailable) {
      purchase.quantityAvailable = purchase.quantity;
    }

    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Only allow deletion by the requester or an admin
    if (purchase.requestedBy.toString() !== req.user._id.toString() && req.user.rank !== 'General') {
      return res.status(403).json({ message: 'Not authorized to delete this purchase' });
    }

    await purchase.deleteOne();
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve purchase
const approvePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Only allow approval by higher ranks
    const allowedRanks = ['General', 'Colonel', 'Major'];
    if (!allowedRanks.includes(req.user.rank)) {
      return res.status(403).json({ message: 'Not authorized to approve purchases' });
    }

    purchase.status = 'Approved';
    purchase.approvedBy = req.user._id;
    purchase.updatedAt = Date.now();

    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPurchases,
  getAvailableEquipment,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  updatePurchaseStatus,
  deletePurchase,
  approvePurchase
}; 