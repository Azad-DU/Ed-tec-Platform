const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const resetPassword = async () => {
  console.log('--- Password Reset Tool ---');

  // Determine if we need SSL (Aiven databases typically use ssl-mode=REQUIRED)
  const sslConfig = (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_platform',
    port: process.env.DB_PORT || 3306, // Default to 3306
    ssl: sslConfig
  });

  rl.question('Enter email (e.g., admin@edtech.bd): ', (email) => {
    rl.question('Enter new password: ', async (password) => {

      if (!email || !password) {
        console.log('❌ Error: Email and password are required.');
        await connection.end();
        rl.close();
        return;
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await connection.execute(
          'UPDATE users SET password_hash = ? WHERE email = ?',
          [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
          console.log(`✅ Success: Password for '${email}' has been updated.`);
        } else {
          console.log(`❌ Error: User '${email}' not found.`);
        }

      } catch (error) {
        console.error('❌ Database Error:', error.message);
      } finally {
        await connection.end();
        rl.close();
        process.exit(0);
      }
    });
  });
};

resetPassword();
