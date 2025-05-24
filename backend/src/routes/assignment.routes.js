const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentsByPersonnel,
  updateAssignment,
  deleteAssignment,
  updateStatus
} = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/rbac.middleware');

router.route('/')
  .post(protect, checkPermission('create_assignment'), createAssignment)
  .get(protect, getAllAssignments);

router.route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, checkPermission('update_own_assignment'), updateAssignment)
  .delete(protect, checkPermission('delete_own_assignment'), deleteAssignment);

router.get('/personnel/:personnelId', protect, getAssignmentsByPersonnel);
router.patch('/:id/status', protect, checkPermission('update_own_assignment'), updateStatus);

module.exports = router; 