/**
 * setup_new_db.js — Set up schema + default settings on the new Neon DB
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to new database.\n');

    // Read and clean schema SQL
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
    const cleanSQL = schemaSQL.replace(/EXPLAIN ANALYZE[\s\S]*?LIMIT 50 OFFSET 0;/m, '').trim();

    console.log('📐 Creating schema...');
    await client.query(cleanSQL);
    console.log('✅ Schema created.\n');

    // Run additional column migrations to be safe
    console.log('🔧 Ensuring all columns exist...');
    await client.query(`
      ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'rent',
      ADD COLUMN IF NOT EXISTS category VARCHAR(30),
      ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
      ADD COLUMN IF NOT EXISTS area_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
      ADD COLUMN IF NOT EXISTS total_price NUMERIC,
      ADD COLUMN IF NOT EXISTS municipal_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS revenue_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS price_per_hour NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(12, 2)
    `);
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log('✅ All columns verified.\n');

    // Verify
    const { rows: tables } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    console.log('📋 Tables created:');
    for (const { tablename } of tables) {
      const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM "${tablename}"`);
      console.log(`   ✅ ${tablename} (${rows[0].cnt} rows)`);
    }

    console.log('\n🎉 New database is ready! Your app should work now.');
    console.log('   Start the backend with: npm run dev');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
