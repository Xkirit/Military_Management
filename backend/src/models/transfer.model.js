const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  equipment: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  fromLocation: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  toLocation: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Transit', 'Completed', 'Cancelled'],
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
  expectedDate: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  actualDate: {
    type: Date
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
transferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer; 