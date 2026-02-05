const { promisePool } = require('./config/database');
require('dotenv').config();

async function checkSchema() {
  try {
    const [columns] = await promisePool.query('SHOW COLUMNS FROM modules');
    console.log('Modules Columns:', columns);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
}

checkSchema();
