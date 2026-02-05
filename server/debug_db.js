const { promisePool } = require('./config/database');
require('dotenv').config();

async function debugCourses() {
  try {
    const [courses] = await promisePool.query('SELECT course_id, title, instructor_id, is_published FROM courses');
    console.log('ALL COURSES IN DB:', courses);

    const [users] = await promisePool.query('SELECT user_id, email, role FROM users');
    console.log('ALL USERS:', users);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
}

debugCourses();
