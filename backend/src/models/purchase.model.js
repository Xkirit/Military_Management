const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Weapons', 'Vehicles', 'Communications', 'Medical', 'Protective', 'Office Supplies', 'Other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  quantityAvailable: {
    type: Number,
    default: function() { return this.quantity; }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  requiredDate: {
    type: Date,
    required: true
  },
  justification: {
    type: String,
    required: [true, 'Justification is required'],
    trim: true
  },
  specifications: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
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


purchaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


purchaseSchema.virtual('date').get(function() {
  return this.createdAt;
});


purchaseSchema.set('toJSON', { virtuals: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase; 