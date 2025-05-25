const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Equipment', 'Training', 'Maintenance', 'Operations', 'Personnel', 'Medical', 'Other'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Operations', 'Logistics', 'Training', 'Maintenance', 'Intelligence', 'Medical']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Other'],
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  budgetYear: {
    type: Number,
    required: true
  },
  quarter: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  attachments: [{
    type: String 
  }],
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


expenditureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


expenditureSchema.virtual('totalAmount').get(function() {
  return this.amount * 1.1; 
});


expenditureSchema.set('toJSON', { virtuals: true });
expenditureSchema.set('toObject', { virtuals: true });

const Expenditure = mongoose.model('Expenditure', expenditureSchema);

module.exports = Expenditure; 