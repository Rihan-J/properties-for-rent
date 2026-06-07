require('dotenv').config();
const pool = require('./src/config/db');

async function run() {
  try {
    const res = await pool.query("UPDATE users SET role = 'user' WHERE role = 'owner'");
    console.log(`Successfully updated ${res.rowCount} users from 'owner' to 'user'`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}
run();
