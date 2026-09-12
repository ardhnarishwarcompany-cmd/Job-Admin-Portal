import { connection } from './db.js';
async function run() {
  const [rows] = await connection.promise().query('DESCRIBE applications');
  console.log(rows.find(r => r.Field === 'status'));
  process.exit(0);
}
run();
