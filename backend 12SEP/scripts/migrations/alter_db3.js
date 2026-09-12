const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DATABASE
});

conn.query('ALTER TABLE notifications MODIFY COLUMN type VARCHAR(100) DEFAULT "system"', (err, results) => {
  if (err) {
    console.error('Error altering table:', err.message);
  } else {
    console.log('Successfully altered notifications table type column to VARCHAR(100)');
  }
  conn.end();
});
