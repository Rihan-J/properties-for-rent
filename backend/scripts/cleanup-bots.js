require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanupBots() {
  console.log('Starting bot cleanup script...');
  
  try {
    // We want to delete users who:
    // 1. Are NOT email_verified
    // 2. Have 0 properties listed
    // 3. Registered more than 24 hours ago (to give real users time to verify)
    // 4. Have role = 'user' (never delete admins)

    const result = await pool.query(`
      WITH deleted_users AS (
        DELETE FROM users u
        WHERE u.email_verified = false
          AND u.role = 'user'
          AND u.created_at < NOW() - INTERVAL '24 hours'
          AND NOT EXISTS (
            SELECT 1 FROM properties p WHERE p.owner_id = u.id
          )
        RETURNING u.id, u.email
      )
      SELECT * FROM deleted_users;
    `);

    console.log(`✅ Cleanup complete. Deleted ${result.rowCount} unverified bot accounts.`);
    
    // Optionally log the deleted emails if there aren't too many
    if (result.rowCount > 0 && result.rowCount < 100) {
      console.log('Deleted emails:');
      result.rows.forEach(r => console.log(` - ${r.email}`));
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

cleanupBots();
