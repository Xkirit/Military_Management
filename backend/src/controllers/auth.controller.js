const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, rank, department, base, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      rank,
      department,
      base,
      role: role || 'Logistics Officer'
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank,
        department: user.department,
        base: user.base,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'No user found with this email address' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password provided' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank,
        department: user.department,
        base: user.base,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank,
      department: user.department,
      base: user.base,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get current user', error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { search, base, department, role } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rank: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (base) query.base = base;
    if (department) query.department = department;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('firstName lastName email rank department base role')
      .sort({ lastName: 1, firstName: 1 })
      .limit(50);

    res.json({
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('firstName lastName email rank department base role createdAt')
      .sort({ createdAt: -1 });

    res.json({
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  searchUsers,
  getAllUsers
}; 