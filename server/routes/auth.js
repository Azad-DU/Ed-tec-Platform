const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, validationRules, authLimiter } = require('../middleware/security');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post(
  '/register',
  // authLimiter,
  validate([
    validationRules.email,
    validationRules.password,
    validationRules.fullName
  ]),
  authController.register
);

router.post(
  '/login',
  // authLimiter,
  validate([
    validationRules.email,
    validationRules.password
  ]),
  authController.login
);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/refresh-token', verifyToken, authController.refreshToken);

module.exports = router;
