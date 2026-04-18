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
      ADD COLUMN IF NOT EXISTS category VARCHAR(30),
      ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
      ADD COLUMN IF NOT EXISTS area_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS total_price NUMERIC,
      ADD COLUMN IF NOT EXISTS municipal_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS revenue_type VARCHAR(50)
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties (latitude, longitude)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc ON properties (created_at DESC)');

    console.log('Migration successful: schema + performance indexes are up to date.');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}

migrate();
