const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edtech_platform'
};

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const [columns] = await connection.query('DESCRIBE enrollments');
    console.log('Enrollments table structure:');
    console.log(JSON.stringify(columns, null, 2));

    const [status] = await connection.query("SHOW COLUMNS FROM enrollments LIKE 'enrollment_status'");
    console.log('Enrollment Status Type:', status[0].Type);

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
