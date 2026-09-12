const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DATABASE
});

const alterQuery = `
  ALTER TABLE users 
  ADD COLUMN resetPasswordToken VARCHAR(255) NULL, 
  ADD COLUMN resetPasswordExpires DATETIME NULL;
`;

conn.query(alterQuery, (err, results) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns resetPasswordToken and resetPasswordExpires already exist.');
    } else {
      console.error('Error altering users table:', err.message);
    }
  } else {
    console.log('Successfully added resetPasswordToken and resetPasswordExpires columns to users table');
  }
  conn.end();
});
