const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getDepartmentSummary,
  getRecentActivities,
  getNetMovementDetails
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes
router.use(protect);

// Dashboard routes
router.get('/metrics', getDashboardMetrics);
router.get('/departments', getDepartmentSummary);
router.get('/activities', getRecentActivities);
router.get('/net-movement', getNetMovementDetails);

module.exports = router; 