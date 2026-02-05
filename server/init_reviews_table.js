require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initReviewsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3308,
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, 'create_reviews_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('--- Executing SQL from create_reviews_table.sql ---');
    await connection.query(sql);
    console.log('Successfully created reviews table and indexes.');

  } catch (error) {
    console.error('Error executing SQL:', error.message);
  } finally {
    await connection.end();
  }
}

initReviewsTable();
