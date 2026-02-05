const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { generalLimiter, sanitizeInput } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const xapiRoutes = require('./routes/xapi');
const assessmentRoutes = require('./routes/assessments');
const discussionRoutes = require('./routes/discussions');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
// Trust Proxy for Render/Vercel (needed for req.protocol to be 'https')
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://www.youtube.com", "https://s.ytimg.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "https://i.ytimg.com"],
      frameSrc: ["*"],
      mediaSrc: ["'self'", "https:", "http:", "blob:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
// app.use(generalLimiter);

// Input sanitization
app.use(sanitizeInput);

// Static files (for uploaded content) with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/xapi', xapiRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 eLearning Platform Server`);
      console.log('='.repeat(50));
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Database connected`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
      console.log(`✓ Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
