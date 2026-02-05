require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateCourse() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3308
  });

  try {
    const [result] = await connection.query(`UPDATE courses SET mentor_name = 'Test Mentor' WHERE title = 'fsdf'`);
    console.log('Updated rows:', result.changedRows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateCourse();
