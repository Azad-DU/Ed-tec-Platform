require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3308
  });

  try {
    console.log('--- Tables in Database ---');
    const [rows] = await connection.query('SHOW TABLES');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });

    console.log('\n--- Reviews Table Schema ---');
    try {
      const [columns] = await connection.query('DESCRIBE reviews');
      columns.forEach(col => console.log(`${col.Field} (${col.Type})`));
    } catch (err) {
      console.log('Reviews table does not exist or error describing it:', err.message);
    }

  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
