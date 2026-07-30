require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Finding bot accounts...');

    // Delete accounts named exactly 'rajesh' (case insensitive) 
    // OR accounts created in the last 24 hours,
    // BUT only if they haven't posted any properties (to be safe).
    
    // First, let's see how many there are.
    const findRes = await pool.query(`
      SELECT id, name, email, created_at 
      FROM users 
      WHERE (name ILIKE '%rajesh%' OR created_at >= NOW() - INTERVAL '24 hours')
      AND NOT EXISTS (
        SELECT 1 FROM properties WHERE properties.owner_id = users.id
      )
    `);

    console.log(`Found ${findRes.rowCount} accounts to delete.`);
    
    if (findRes.rowCount > 0) {
      const deleteRes = await pool.query(`
        DELETE FROM users 
        WHERE (name ILIKE '%rajesh%' OR created_at >= NOW() - INTERVAL '24 hours')
        AND NOT EXISTS (
          SELECT 1 FROM properties WHERE properties.owner_id = users.id
        )
      `);
      console.log(`Successfully deleted ${deleteRes.rowCount} bot accounts.`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

run();
