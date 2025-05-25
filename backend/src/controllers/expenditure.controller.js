const Expenditure = require('../models/expenditure.model');
const mongoose = require('mongoose');

exports.createExpenditure = async (req, res) => {
  try {
    const expenditure = new Expenditure({
      ...req.body,
      requestedBy: req.user._id
    });
    
    const savedExpenditure = await expenditure.save();
    res.status(201).json(savedExpenditure);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating expenditure',
      error: error.message
    });
  }
};

exports.getAllExpenditures = async (req, res) => {
  try {
    const { department, category, startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userBase = req.user.base;
    
    let query = {};

    if (userRole === 'Admin') {
      
    } else {
      const User = require('../models/user.model');
      const baseUserIds = await User.find({ base: userBase }).select('_id');
      query.requestedBy = { $in: baseUserIds.map(user => user._id) };
    }

    if (department) query.department = department;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const expenditures = await Expenditure.find(query)
      .populate('requestedBy', 'firstName lastName role base')
      .sort({ createdAt: -1 });
    
    res.status(200).json(expenditures);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching expenditures',
      error: error.message
    });
  }
};

exports.getExpenditureById = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id)
      .populate('requestedBy', 'firstName lastName role');
    
    if (!expenditure) {
      return res.status(404).json({ message: 'Expenditure not found' });
    }
    
    res.status(200).json(expenditure);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching expenditure',
      error: error.message
    });
  }
};

exports.getExpenditureSummary = async (req, res) => {
  try {
    const { budgetYear, quarter } = req.query;
    let matchQuery = {};
    
    if (budgetYear) matchQuery.budgetYear = parseInt(budgetYear);
    if (quarter) matchQuery.quarter = parseInt(quarter);

    const summary = await Expenditure.aggregate([
      { $match: matchQuery },
      { $group: {
        _id: {
          department: '$department',
          category: '$category'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $group: {
        _id: '$_id.department',
        categories: {
          $push: {
            category: '$_id.category',
            totalAmount: '$totalAmount',
            count: '$count'
          }
        },
        departmentTotal: { $sum: '$totalAmount' }
      }}
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      message: 'Error generating expenditure summary',
      error: error.message
    });
  }
};

exports.updateExpenditure = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id);
    
    if (!expenditure) {
      return res.status(404).json({ message: 'Expenditure not found' });
    }

    const updatedExpenditure = await Expenditure.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExpenditure);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating expenditure',
      error: error.message
    });
  }
};

exports.deleteExpenditure = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id);
    
    if (!expenditure) {
      return res.status(404).json({ message: 'Expenditure not found' });
    }

    await Expenditure.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expenditure deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting expenditure',
      error: error.message
    });
  }
}; 