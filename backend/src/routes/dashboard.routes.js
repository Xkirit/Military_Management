const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// Get dashboard metrics
router.get('/metrics', protect, dashboardController.getDashboardMetrics);

// Get department summary
router.get('/departments', protect, dashboardController.getDepartmentSummary);

// Get recent activities
router.get('/activities', protect, dashboardController.getRecentActivities);

module.exports = router; 