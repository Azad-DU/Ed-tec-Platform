const axios = require('axios');
const { promisePool } = require('../config/database');
const { tokenize, generateSecureToken } = require('../utils/tokenization');
require('dotenv').config();

/**
 * Initiate payment session with SSLCommerz
 */
const initiatePayment = async (req, res) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.user_id;

    // Get course details
    const [courses] = await promisePool.query(
      'SELECT course_id, title, price, currency FROM courses WHERE course_id = ?',
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courses[0];

    // Check if already enrolled
    const [existingEnrollments] = await promisePool.query(
      'SELECT enrollment_id, enrollment_status FROM enrollments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );

    let enrollment_id;

    if (existingEnrollments.length > 0) {
      const enrollment = existingEnrollments[0];
      if (enrollment.enrollment_status === 'active' || enrollment.enrollment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'You are already enrolled in this course'
        });
      }
      enrollment_id = enrollment.enrollment_id;
    } else {
      // Create enrollment with 'on_hold' status
      const [enrollmentResult] = await promisePool.query(
        'INSERT INTO enrollments (student_id, course_id, enrollment_status) VALUES (?, ?, ?)',
        [student_id, course_id, 'on_hold']
      );
      enrollment_id = enrollmentResult.insertId;
    }

    // Generate unique transaction ID
    const transactionId = `EDTECH-${Date.now()}-${generateSecureToken(8)}`;

    // Create transaction record
    const [transactionResult] = await promisePool.query(
      'INSERT INTO transactions (enrollment_id, student_id, course_id, amount, currency, payment_status, sslcommerz_session_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [enrollment_id, student_id, course_id, course.price, course.currency, 'pending', transactionId]
    );

    const transaction_id = transactionResult.insertId;

    // Get user details
    const [users] = await promisePool.query(
      'SELECT email, full_name, phone FROM users WHERE user_id = ?',
      [student_id]
    );

    const user = users[0];

    // Prepare SSLCommerz payment data
    const paymentData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: course.price,
      currency: course.currency || 'BDT',
      tran_id: transactionId,
      success_url: `${process.env.CLIENT_URL}/payment/success`,
      fail_url: `${process.env.CLIENT_URL}/payment/fail`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      ipn_url: `${process.env.CLIENT_URL}/api/payments/ipn`,
      product_name: course.title,
      product_category: 'Education',
      product_profile: 'non-physical-goods',
      cus_name: user.full_name,
      cus_email: user.email,
      cus_phone: user.phone || '01700000000',
      cus_add1: 'Dhaka, Bangladesh',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      multi_card_name: 'mastercard,visacard,amexcard',
      value_a: transaction_id.toString(),
      value_b: enrollment_id.toString(),
      value_c: course_id.toString()
    };

    // Determine API URL based on environment
    const apiUrl = process.env.SSLCOMMERZ_SANDBOX === 'true'
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    // Initiate payment with SSLCommerz
    const response = await axios.post(apiUrl, new URLSearchParams(paymentData), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.status === 'SUCCESS') {
      res.json({
        success: true,
        message: 'Payment session initiated',
        data: {
          gateway_url: response.data.GatewayPageURL,
          transaction_id: transactionId,
          amount: course.price,
          currency: course.currency
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message
    });
  }
};

/**
 * Handle payment success callback from SSLCommerz
 */
const paymentSuccess = async (req, res) => {
  try {
    const { val_id, tran_id, amount, card_type, store_amount, currency } = req.body;

    // Validate payment with SSLCommerz
    const validationUrl = process.env.SSLCOMMERZ_SANDBOX === 'true'
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

    const validationParams = {
      val_id,
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      format: 'json'
    };

    const validation = await axios.get(validationUrl, { params: validationParams });

    if (validation.data.status === 'VALID' || validation.data.status === 'VALIDATED') {
      // Tokenize sensitive payment data
      const validationToken = tokenize(JSON.stringify({
        val_id,
        card_type,
        store_amount
      }));

      // Update transaction status
      await promisePool.query(
        'UPDATE transactions SET payment_status = ?, sslcommerz_transaction_id = ?, validation_token = ?, payment_method = ?, payment_date = CURRENT_TIMESTAMP WHERE sslcommerz_session_id = ?',
        ['success', val_id, validationToken, card_type, tran_id]
      );

      // Get enrollment ID from transaction
      const [transactions] = await promisePool.query(
        'SELECT enrollment_id FROM transactions WHERE sslcommerz_session_id = ?',
        [tran_id]
      );

      if (transactions.length > 0) {
        const enrollment_id = transactions[0].enrollment_id;

        // Update enrollment status to 'active'
        await promisePool.query(
          'UPDATE enrollments SET enrollment_status = ?, enrollment_date = CURRENT_TIMESTAMP WHERE enrollment_id = ?',
          ['active', enrollment_id]
        );
      }

      res.json({
        success: true,
        message: 'Payment successful. Enrollment activated!',
        data: {
          transaction_id: tran_id,
          amount,
          currency
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment validation failed'
      });
    }
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

/**
 * Handle payment failure callback
 */
const paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await promisePool.query(
      'UPDATE transactions SET payment_status = ? WHERE sslcommerz_session_id = ?',
      ['failed', tran_id]
    );

    res.json({
      success: false,
      message: 'Payment failed. Please try again.'
    });
  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment failure',
      error: error.message
    });
  }
};

/**
 * Handle payment cancellation callback
 */
const paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await promisePool.query(
      'UPDATE transactions SET payment_status = ? WHERE sslcommerz_session_id = ?',
      ['cancelled', tran_id]
    );

    res.json({
      success: false,
      message: 'Payment cancelled by user'
    });
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment cancellation',
      error: error.message
    });
  }
};

/**
 * Get transaction history for a user
 */
const getTransactionHistory = async (req, res) => {
  try {
    const student_id = req.user.user_id;

    const [transactions] = await promisePool.query(
      `SELECT t.transaction_id, t.amount, t.currency, t.payment_status, t.payment_method, 
              t.payment_date, t.created_at, c.title as course_title, c.course_id
       FROM transactions t
       JOIN courses c ON t.course_id = c.course_id
       WHERE t.student_id = ?
       ORDER BY t.created_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction history',
      error: error.message
    });
  }
};

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getTransactionHistory
};
