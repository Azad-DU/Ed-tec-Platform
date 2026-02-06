const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'localhost', // Force localhost
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edtech_platform'
};

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to database at ${dbConfig.host}`);

    const [allColumns] = await connection.query("SHOW COLUMNS FROM reviews");
    console.log('All columns:', JSON.stringify(allColumns.map(c => c.Field), null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

checkSchema();
