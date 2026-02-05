const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Strict rate limiter for authentication endpoints (increased for development)
const authLimiter = createRateLimiter(15 * 60 * 1000, 50000);

// Payment rate limiter
const paymentLimiter = createRateLimiter(15 * 60 * 1000, 10);

// Input validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Common validation rules
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  fullName: body('full_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),

  phone: body('phone')
    .optional()
    .matches(/^(?:\+8801|01)[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),

  sanitizeString: (fieldName) =>
    body(fieldName)
      .trim()
      .escape()
      .withMessage(`${fieldName} contains invalid characters`)
};

// SQL injection prevention (additional layer, parameterized queries are primary defense)
const sanitizeInput = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT)\b)/gi;

  const checkObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && sqlPattern.test(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object') {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  validate,
  validationRules,
  sanitizeInput
};
