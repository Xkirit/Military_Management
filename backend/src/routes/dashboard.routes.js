const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getDepartmentSummary,
  getRecentActivities,
  getNetMovementDetails
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');


router.use(protect);


router.get('/metrics', getMetrics);
router.get('/departments', getDepartmentSummary);
router.get('/activities', getRecentActivities);
router.get('/net-movement', getNetMovementDetails);

module.exports = router; 