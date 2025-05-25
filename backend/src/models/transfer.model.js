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
  sourceBaseId: {
    type: String,
    required: [true, 'Source base is required'],
    enum: ['Base A', 'Base B', 'Base C', 'Base D', 'Headquarters']
  },
  destinationBaseId: {
    type: String,
    required: [true, 'Destination base is required'],
    enum: ['Base A', 'Base B', 'Base C', 'Base D', 'Headquarters']
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase' 
  },
  reason: {
    type: String,
    trim: true,
    default: 'Equipment transfer'
  },
  transportMethod: {
    type: String,
    enum: ['Ground Transport', 'Air Transport', 'Naval Transport', 'Personnel Carry'],
    default: 'Ground Transport'
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


transferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer; 