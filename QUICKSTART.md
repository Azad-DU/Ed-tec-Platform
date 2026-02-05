# Quick Start Guide

## Current Status

### ✅ Frontend - RUNNING
- **URL**: http://localhost:3000
- **Status**: React development server running successfully
- **Note**: Minor eslint warning (safe to ignore)

### ⚠️ Backend - NEEDS DATABASE SETUP
- **Port**: 5000 (will run once database is configured)
- **Issue**: MySQL database not configured yet

---

## 🔧 To Get Backend Running

### Option 1: Quick Setup (No Database)
If you want to test the frontend UI without backend functionality:
- Frontend is already running at http://localhost:3000
- You can view Login, Register pages and UI components
- Backend features (login, courses, etc.) won't work until database is set up

### Option 2: Full Setup (With Database)

**Step 1: Install MySQL**
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use XAMPP: https://www.apachefriends.org/

**Step 2: Create Database**
```bash
# Open MySQL command line or phpMyAdmin
mysql -u root -p

# Create database
CREATE DATABASE edtech_platform;
exit;
```

**Step 3: Import Schema**
```bash
# From command line
cd "K:\Web Development\Ed-tec platform"
mysql -u root -p edtech_platform < database/schema.sql
```

**Step 4: Update .env File**
Edit `server/.env` and set your MySQL password:
```
DB_PASSWORD=your_actual_mysql_password
```
(Replace `your_actual_mysql_password` with your MySQL root password)

**Step 5: Start Backend**
```bash
cd server
npm run dev
```

---

## 🎯 What's Currently Working

### Frontend Pages (Already Live at localhost:3000)
- ✅ Login page (beautiful gradient design)
- ✅ Register page (full registration form)
- ✅ Navigation bar
- ✅ Routing setup
- ⏳ Dashboard (needs backend API)
- ⏳ Course pages (needs backend API)

### Backend API (Ready, waiting for database)
- ✅ All controllers built
- ✅ SSLCommerz payment integration
- ✅ Authentication system
- ✅ Security middleware
- ✅ File upload handling

---

## 🌐 Access the Application

**Frontend**: http://localhost:3000

Once MySQL is set up, backend will run on: http://localhost:5000

---

## 📝 Test Accounts

After database setup, you can use:
- **Email**: admin@edtech.bd
- **Password**: admin123 (change immediately!)

Or create a new account via the Register page.

---

## ❓ Need Help?

If you don't have MySQL installed or need assistance with database setup, let me know and I can guide you through the installation process!
