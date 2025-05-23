const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');

// Create a new assignment
router.post('/', protect, assignmentController.createAssignment);

// Get all assignments
router.get('/', protect, assignmentController.getAllAssignments);

// Get assignment by ID
router.get('/:id', protect, assignmentController.getAssignmentById);

// Get assignments by personnel
router.get('/personnel/:personnelId', protect, assignmentController.getAssignmentsByPersonnel);

// Update assignment
router.put('/:id', protect, assignmentController.updateAssignment);

// Delete assignment
router.delete('/:id', protect, assignmentController.deleteAssignment);

// Update assignment status
router.patch('/:id/status', protect, assignmentController.updateStatus);

module.exports = router; 