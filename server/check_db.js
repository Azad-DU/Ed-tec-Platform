require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkCourses() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3308
  });

  try {
    const [rows] = await connection.query('SELECT course_id, title, mentor_name, is_free, price FROM courses ORDER BY course_id DESC LIMIT 5');
    console.log('Recent 5 Courses:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkCourses();
