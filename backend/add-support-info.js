/**
 * Migration: Create support_info table and seed initial data.
 * Run once: node add-support-info.js
 */
require('dotenv').config();
const pool = require('./src/config/db');

async function migrate() {
  try {
    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_info (
        id SERIAL PRIMARY KEY,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        instagram TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "support_info" created (or already exists).');

    // Seed initial row if empty
    const existing = await pool.query('SELECT id FROM support_info LIMIT 1');
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO support_info (email, phone, whatsapp, instagram)
         VALUES ($1, $2, $3, $4)`,
        ['support@apnastay.com', '9876543210', '9876543210', '@apnastay']
      );
      console.log('✅ Seeded initial support info row.');
    } else {
      console.log('ℹ  Support info row already exists, skipping seed.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
