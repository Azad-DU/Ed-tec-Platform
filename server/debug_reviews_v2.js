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
    console.log('--- Checking Users Table Schema ---');
    const [columns] = await connection.query('DESCRIBE users');
    const profilePicColumn = columns.find(c => c.Field === 'profile_picture_url');
    console.log('Has profile_picture_url?', !!profilePicColumn);
    if (!profilePicColumn) {
      console.log('Columns found:', columns.map(c => c.Field).join(', '));
    }

    console.log('\n--- Running Controller Query ---');
    try {
      const [reviews] = await connection.query(
        `SELECT r.review_id, r.rating, r.comment as review_text, r.created_at,
                u.full_name, u.role, u.profile_picture_url,
                c.title as course_title, c.course_id
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN courses c ON r.course_id = c.course_id
        WHERE r.rating >= 4
        ORDER BY r.created_at DESC
        LIMIT 10`
      );
      console.log('Query success! found:', reviews.length);
      console.log(reviews);
    } catch (err) {
      console.log('Query FAILED:', err.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugReviews();
