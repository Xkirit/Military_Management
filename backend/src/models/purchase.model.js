const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
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
  description: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String // URLs to attached files
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

// Update the updatedAt timestamp before saving
purchaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase; 