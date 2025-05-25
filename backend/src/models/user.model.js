const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  rank: {
    type: String,
    required: [true, 'Rank is required'],
    enum: ['Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain', 'Major', 'Colonel', 'General'],
    default: 'Private'
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Admin', 'Base Commander', 'Logistics Officer'],
    default: 'Logistics Officer'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Operations', 'Logistics', 'Training', 'Maintenance', 'Intelligence', 'Medical']
  },
  base: {
    type: String,
    required: [true, 'Base assignment is required'],
    enum: ['Base A', 'Base B', 'Base C', 'Base D', 'Headquarters'],
    default: 'Base A'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 