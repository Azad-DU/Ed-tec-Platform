const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/security');

// Protected routes
router.post('/initiate', verifyToken, paymentLimiter, paymentController.initiatePayment);
router.get('/history', verifyToken, paymentController.getTransactionHistory);

// SSLCommerz callback routes (these receive POST from SSLCommerz)
router.post('/success', paymentController.paymentSuccess);
router.post('/fail', paymentController.paymentFail);
router.post('/cancel', paymentController.paymentCancel);
router.post('/ipn', paymentController.paymentSuccess);  // IPN uses same logic as success

module.exports = router;
