const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sanchitdb',
    database: 'jobportal1'
  });

  const columns = [
    'gstNumber VARCHAR(100)',
    'adminCode VARCHAR(100)',
    'profilePhoto TEXT',
    'resumeOriginalName TEXT',
    'bio TEXT',
    'skills TEXT',
    'city VARCHAR(255)',
    'experience VARCHAR(255)',
    'education VARCHAR(255)',
    'profileRole VARCHAR(255)'
  ];

  for (const col of columns) {
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN ${col}`);
      console.log('Added ' + col);
    } catch(e) {
      console.log('Skipped ' + col + ' - ' + e.code);
    }
  }

  conn.end();
}

run();
