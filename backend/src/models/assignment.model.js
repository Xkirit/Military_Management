const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  personnel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Personnel is required']
  },
  assignment: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  qty: {
    type: Number,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Completed', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  duties: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    trim: true
  },
  equipmentPurchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  equipmentQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  equipment: {
    type: String,
    trim: true,
    default: ''
  },
  equipmentType: {
    type: String,
    enum: ['', 'Weapons', 'Vehicles', 'Communications', 'Medical', 'Protective', 'Tools', 'Other'],
    default: ''
  },
  attachments: [{
    type: String 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


assignmentSchema.post('save', async function(doc) {
  if (doc.equipmentPurchase && doc.equipmentQuantity > 0) {
    try {
      const Purchase = require('./purchase.model');
      await Purchase.findByIdAndUpdate(
        doc.equipmentPurchase,
        { $inc: { quantityAvailable: -doc.equipmentQuantity } }
      );
    } catch (error) {
      console.error('Error updating equipment availability:', error);
    }
  }
});


assignmentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  if (this.equipmentPurchase && this.equipmentQuantity > 0) {
    try {
      const Purchase = require('./purchase.model');
      await Purchase.findByIdAndUpdate(
        this.equipmentPurchase,
        { $inc: { quantityAvailable: this.equipmentQuantity } }
      );
    } catch (error) {
      console.error('Error restoring equipment availability:', error);
    }
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 