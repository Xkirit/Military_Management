const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, searchUsers, getAllUsers } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');


router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);


router.get('/users/search', protect, searchUsers);
router.get('/users', protect, getAllUsers);

module.exports = router; 