/**
 * Migration: Add accepted_terms column to users table.
 * Run once: node add-accepted-terms.js
 */
require('dotenv').config();
const pool = require('./src/config/db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT false
    `);
    console.log('✅ Column "accepted_terms" added to users table (or already exists).');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
