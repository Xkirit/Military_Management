const Assignment = require('../models/assignment.model');
const Purchase = require('../models/purchase.model');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
      assignedBy: req.user._id
    });
    
    await assignment.save();
    await assignment.populate(['personnel', 'assignedBy', 'equipmentPurchase']);
    
    res.status(201).json(assignment);
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
    const userRole = req.user.role;
    const userBase = req.user.base;
    
    console.log(`Assignment Debug - User: ${userRole} from ${userBase}`);
    
    let filter = {};
    
    if (userRole === 'Admin') {
      // Admin sees ALL assignments from all bases
      console.log('Assignment Debug - Admin user, fetching all assignments');
      filter = {}; // No base restriction
    } else {
      // Base Commander and Logistics Officer see only assignments from their base
      console.log(`Assignment Debug - ${userRole} user, fetching assignments for base: ${userBase}`);
      const User = require('../models/user.model');
      const baseUserIds = await User.find({ base: userBase }).select('_id');
      filter = { assignedBy: { $in: baseUserIds.map(user => user._id) } };
    }
    
    console.log('Assignment Debug - Filter applied:', filter);
    
    const assignments = await Assignment.find(filter)
      .populate('personnel', 'firstName lastName rank department base')
      .populate('assignedBy', 'firstName lastName rank base')
      .populate('equipmentPurchase', 'item category unitPrice')
      .sort({ createdAt: -1 });
    
    console.log(`Assignment Debug - Found ${assignments.length} assignments`);
    
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Assignment Debug - Error:', error);
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
      .populate('personnel', 'firstName lastName rank department')
      .populate('assignedBy', 'firstName lastName rank')
      .populate('equipmentPurchase', 'item category unitPrice supplier');
    
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
      .populate('personnel', 'firstName lastName rank department')
      .populate('assignedBy', 'firstName lastName rank')
      .populate('equipmentPurchase', 'item category unitPrice')
      .sort({ createdAt: -1 });
    
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignments for personnel',
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

    if (assignment.status === 'Completed') {
      return res.status(400).json({ 
        message: 'Cannot update completed assignment' 
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['personnel', 'assignedBy', 'equipmentPurchase']);
    
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

    if (assignment.status === 'Completed' && status !== 'Completed') {
      return res.status(400).json({ 
        message: 'Cannot change status of completed assignment' 
      });
    }

    const allowedStatuses = ['Pending', 'Active', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status: ${status}. Allowed statuses: ${allowedStatuses.join(', ')}` 
      });
    }

    // Equipment return logic when assignment is completed
    if (status === 'Completed' && assignment.equipmentPurchase && assignment.equipmentQuantity > 0) {
      try {
        const purchase = await Purchase.findById(assignment.equipmentPurchase);
        if (purchase) {
          purchase.quantityAvailable = (purchase.quantityAvailable || 0) + assignment.equipmentQuantity;
          await purchase.save();
          console.log(`Returned ${assignment.equipmentQuantity} units of ${purchase.item} to inventory`);
        }
      } catch (equipmentError) {
        console.error('Error returning equipment to inventory:', equipmentError);
      }
    }

    // Equipment allocation logic when assignment becomes active
    if (status === 'Active' && assignment.equipmentPurchase && assignment.equipmentQuantity > 0) {
      try {
        const purchase = await Purchase.findById(assignment.equipmentPurchase);
        if (purchase) {
          if (purchase.quantityAvailable >= assignment.equipmentQuantity) {
            purchase.quantityAvailable -= assignment.equipmentQuantity;
            await purchase.save();
            console.log(`Allocated ${assignment.equipmentQuantity} units of ${purchase.item} from inventory`);
          } else {
            return res.status(400).json({
              message: `Insufficient equipment available. Required: ${assignment.equipmentQuantity}, Available: ${purchase.quantityAvailable}`
            });
          }
        }
      } catch (equipmentError) {
        console.error('Error allocating equipment from inventory:', equipmentError);
        return res.status(500).json({
          message: 'Error allocating equipment from inventory',
          error: equipmentError.message
        });
      }
    }

    assignment.status = status;
    if (status === 'Completed') {
      assignment.approvedBy = req.user._id;
    }

    await assignment.save();
    await assignment.populate(['personnel', 'assignedBy', 'equipmentPurchase']);
    
    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating assignment status',
      error: error.message
    });
  }
}; 