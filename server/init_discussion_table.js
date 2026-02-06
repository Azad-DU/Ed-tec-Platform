require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDiscussionTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    port: parseInt(process.env.DB_PORT) || 3306 // Try default first, then user's config
  });

  try {
    console.log('--- Initializing Discussion Tables ---');

    // Create discussions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        discussion_id INT PRIMARY KEY AUTO_INCREMENT,
        module_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_qa BOOLEAN DEFAULT FALSE,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ discussions table created/verified');

    // Create discussion_replies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discussion_replies (
        reply_id INT PRIMARY KEY AUTO_INCREMENT,
        discussion_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_instructor_reply BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(discussion_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ discussion_replies table created/verified');

  } catch (error) {
    console.error('Error initializing tables:', error.message);
  } finally {
    await connection.end();
  }
}

initDiscussionTables();
