const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DATABASE
});

conn.query('ALTER TABLE jobs ADD COLUMN jdUrl VARCHAR(255) DEFAULT NULL', (err, results) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('jdUrl column already exists');
    } else {
      console.error('Error altering table:', err.message);
    }
  } else {
    console.log('Successfully added jdUrl to jobs table');
  }
  conn.end();
});
