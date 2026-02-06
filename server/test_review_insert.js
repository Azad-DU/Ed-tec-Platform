const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edtech_platform'
};

async function testInsert() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to ${dbConfig.database} at ${dbConfig.host}`);

    const query = 'INSERT INTO reviews (course_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)';
    // Note: Assuming course_id 1 and user_id 1 exist. If not, this might fail with foreign key error, 
    // which is different from "Unknown column".

    // We will just Prepare parameters, maybe not execute to avoid garbage data if we can avoid it.
    // Actually, PREPARE statement is a good test for column existence.

    await connection.execute('EXPLAIN ' + query, [1, 1, 5, 'Test review']);
    console.log('EXPLAIN query successful - Column review_text exists.');

    await connection.end();
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testInsert();
