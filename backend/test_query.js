const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const userId = 'e3ac1539-198a-4375-bbc1-93334c7088f0'; // user id of owner of 'farhan bro home'
    const params = [userId];
    const whereClause = "WHERE p.owner_id = $1 AND (p.category != 'site' OR u.role = 'admin') AND p.status = 'approved'";
    
    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p JOIN users u ON u.id = p.owner_id ${whereClause}`, params);
    console.log('Count:', countResult.rows[0].count);

    const result = await pool.query(`SELECT p.id, p.title, p.category, p.status FROM properties p JOIN users u ON u.id = p.owner_id ${whereClause} LIMIT 10`, params);
    console.log('Results:', result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
