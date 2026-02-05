const { promisePool } = require('./config/database');
require('dotenv').config();

async function checkLatestLesson() {
  try {
    const [lessons] = await promisePool.query('SELECT * FROM lessons ORDER BY lesson_id DESC LIMIT 1');
    console.log('Latest Lesson:', lessons[0]);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
}

checkLatestLesson();
