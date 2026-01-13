const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  sendOTP,
  verifyOTP
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

// Admin only routes
router.post('/register', authMiddleware, authorize('admin'), registerUser);

module.exports = router;
