const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edtech_platform'
};

async function checkCourses() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const [courses] = await connection.query('SELECT course_id, title, is_published FROM courses');
    console.log('Courses in DB:', JSON.stringify(courses, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error checking courses:', error);
  }
}

checkCourses();
