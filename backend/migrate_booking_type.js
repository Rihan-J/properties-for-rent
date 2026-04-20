// One-time migration: allow 'both' as a booking_type value
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await pool.query(`ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_booking_type_check`);
    await pool.query(`ALTER TABLE properties ADD CONSTRAINT properties_booking_type_check CHECK (booking_type IN ('hourly', 'daily', 'both'))`);
    console.log('✅ booking_type constraint updated to allow "both"');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
