require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
      ADD COLUMN IF NOT EXISTS area_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS total_price NUMERIC,
      ADD COLUMN IF NOT EXISTS municipal_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS revenue_type VARCHAR(50)
    `);
    console.log('Migration successful - 6 columns added to properties table');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}

migrate();
