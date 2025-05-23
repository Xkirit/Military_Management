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
  location: {
    type: String,
    required: [true, 'Assignment location is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Completed', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
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
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
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
assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that end date is after start date
assignmentSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 