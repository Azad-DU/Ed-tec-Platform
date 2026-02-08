require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugReviews() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3308
  });

  try {
    console.log('--- Checking Reviews Table ---');
    const [allReviews] = await connection.query('SELECT * FROM reviews');
    console.log('Total Reviews:', allReviews.length);
    console.log(allReviews);

    console.log('\n--- Testing getAllReviews Query ---');
    // This is the exact query from the controller
    const [joinedBase] = await connection.query(
      `SELECT r.review_id, r.rating, r.comment as review_text,
              u.full_name, c.title as course_title
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.user_id
       LEFT JOIN courses c ON r.course_id = c.course_id`
    );
    console.log('Joined Data (LEFT JOIN check):');
    console.log(joinedBase);

    const [actualQuery] = await connection.query(
      `SELECT r.review_id, r.rating
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       JOIN courses c ON r.course_id = c.course_id
       WHERE r.rating >= 4`
    );
    console.log('\nActual Query Result Count:', actualQuery.length);

    if (joinedBase.length > 0 && actualQuery.length === 0) {
      console.log('WARN: Data exists but INNER JOIN or WHERE clause is filtering it out.');
      // granular checks
      const [orphanedUsers] = await connection.query('SELECT r.review_id FROM reviews r LEFT JOIN users u ON r.user_id = u.user_id WHERE u.user_id IS NULL');
      console.log('Reviews with invalid user_id:', orphanedUsers.length);

      const [orphanedCourses] = await connection.query('SELECT r.review_id FROM reviews r LEFT JOIN courses c ON r.course_id = c.course_id WHERE c.course_id IS NULL');
      console.log('Reviews with invalid course_id:', orphanedCourses.length);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugReviews();
