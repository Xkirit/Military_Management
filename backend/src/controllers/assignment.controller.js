const Assignment = require('../models/assignment.model');
const mongoose = require('mongoose');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
      assignedBy: req.user._id // From auth middleware
    });
    
    const savedAssignment = await assignment.save();
    res.status(201).json(savedAssignment);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('personnel', 'firstName lastName rank')
      .populate('assignedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank')
      .populate('equipmentPurchase', 'item category quantity quantityAvailable supplier specifications')
      .sort({ startDate: 1 });
    
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('personnel', 'firstName lastName rank')
      .populate('assignedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank')
      .populate('equipmentPurchase', 'item category quantity quantityAvailable supplier specifications');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// Get assignments by personnel
exports.getAssignmentsByPersonnel = async (req, res) => {
  try {
    const assignments = await Assignment.find({ personnel: req.params.personnelId })
      .populate('personnel', 'firstName lastName rank')
      .populate('assignedBy', 'firstName lastName rank')
      .populate('approvedBy', 'firstName lastName rank')
      .populate('equipmentPurchase', 'item category quantity quantityAvailable supplier specifications')
      .sort({ startDate: 1 });
    
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only allow updates if assignment is not completed
    if (assignment.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot update completed assignment' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only allow deletion if assignment is pending
    if (assignment.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only delete pending assignments' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// Update assignment status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Pending': ['Active', 'Cancelled'],
      'Active': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };

    if (!validTransitions[assignment.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${assignment.status} to ${status}` 
      });
    }

    assignment.status = status;
    if (status === 'Active') {
      assignment.approvedBy = req.user._id;
    }

    await assignment.save();
    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating assignment status',
      error: error.message
    });
  }
}; 