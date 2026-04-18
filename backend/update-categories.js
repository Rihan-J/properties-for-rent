require('dotenv').config();
const pool = require('./src/config/db');

async function update() {
  try {
    await pool.query("UPDATE properties SET category = 'home' WHERE title ILIKE '%house%' OR title ILIKE '%BHK%'");
    await pool.query("UPDATE properties SET category = 'site' WHERE title ILIKE '%plot%' AND category IS NULL");
    console.log('Categories updated!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
update();
