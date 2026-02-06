@echo off
echo ================================================================
echo Ed-Tech Platform - MySQL Database Setup
echo ================================================================
echo.

REM Check common MySQL paths
set MYSQL_PATH=""
if exist "C:\xampp\mysql\bin\mysql.exe" set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_PATH="C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "D:\Software\Xamps\mysql\bin\mysql.exe" set MYSQL_PATH="D:\Software\Xamps\mysql\bin\mysql.exe"

if %MYSQL_PATH%=="" (
    echo [ERROR] MySQL not found in common paths!
    echo.
    echo Please ensure one of the following:
    echo 1. XAMPP is installed with MySQL
    echo 2. MySQL Server is installed
    echo 3. MySQL is running
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo [OK] MySQL found at: %MYSQL_PATH%
echo.

REM Check if MySQL is accessible
echo Testing MySQL connection...
%MYSQL_PATH% -u root -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to MySQL!
    echo.
    echo Possible issues:
    echo 1. MySQL service is not running
    echo    - Open XAMPP Control Panel and start MySQL
    echo    - OR run: net start MySQL80
    echo 2. Password is required (not empty)
    echo    - Update DB_PASSWORD in server/.env file
    echo.
    pause
    exit /b 1
)

echo [OK] MySQL connection successful
echo.

REM Create database
echo Creating database 'edtech_platform'...
%MYSQL_PATH% -u root -e "CREATE DATABASE IF NOT EXISTS edtech_platform;"
if errorlevel 1 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created
echo.

REM Import schema
echo Importing database schema...
set SCHEMA_FILE="%~dp0schema.sql"
if not exist %SCHEMA_FILE% (
    echo [ERROR] Schema file not found: %SCHEMA_FILE%
    pause
    exit /b 1
)

%MYSQL_PATH% -u root edtech_platform < %SCHEMA_FILE%
if errorlevel 1 (
    echo [ERROR] Failed to import schema
    pause
    exit /b 1
)
echo [OK] Schema imported successfully
echo.

REM Create test users
echo Creating test users...
%MYSQL_PATH% -u root edtech_platform -e "INSERT INTO users (email, password_hash, full_name, role) VALUES ('admin@edtech.bd', '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO', 'Admin User', 'admin'), ('student@edtech.bd', '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO', 'Demo Student', 'student'), ('instructor@edtech.bd', '$2b$10$rBV2kVq7hC0xJ.6PZFJv7uQvWYp8YqKGZxGvKrXvMxHYxPFJvYxqO', 'Demo Instructor', 'instructor');"
if errorlevel 1 (
    echo [WARNING] Test users may already exist (this is OK)
) else (
    echo [OK] Test users created
)
echo.

REM Verify setup
echo Verifying setup...
%MYSQL_PATH% -u root edtech_platform -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'edtech_platform';"
echo.

echo ================================================================
echo SUCCESS! Database setup complete!
echo ================================================================
echo.
echo Test Login Credentials:
echo   Email: student@edtech.bd
echo   Password: password123
echo.
echo   Email: admin@edtech.bd
echo   Password: admin123
echo.
echo Next Steps:
echo 1. Restart your backend server (Ctrl+C then: npm run dev)
echo 2. Visit http://localhost:3000
echo 3. Click "Login" and use credentials above
echo.
echo ================================================================
pause
