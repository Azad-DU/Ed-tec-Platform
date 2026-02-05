-- Quick Setup Script for Ed-Tech Platform Database
-- Run this in MySQL or phpMyAdmin SQL tab

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS edtech_platform;
USE edtech_platform;

-- 2. The main schema will be imported from schema.sql file
-- After importing schema.sql, run the following to create test users:

-- 3. Create Test Users (password is 'password123' for both)
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES 
(
  'admin@edtech.bd',
  '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO',
  'Admin User',
  'admin',
  '+8801712345678',
  TRUE
),
(
  'student@edtech.bd',
  '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO',
  'Demo Student',
  'student',
  '+8801812345678',
  TRUE
),
(
  'instructor@edtech.bd',
  '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO',
  'Demo Instructor',
  'instructor',
  '+8801912345678',
  TRUE
);

-- 4. Verify users created
SELECT user_id, email, full_name, role FROM users;

-- ✅ Test Login Credentials:
-- Email: admin@edtech.bd | Password: password123
-- Email: student@edtech.bd | Password: password123
-- Email: instructor@edtech.bd | Password: password123
