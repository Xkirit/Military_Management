const express = require('express');
const router = express.Router();
const { register, login, getMe, searchUsers, getAllUsers } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// User/Personnel routes
router.get('/users/search', protect, searchUsers);
router.get('/users', protect, getAllUsers);

module.exports = router; 