require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

async function runMigration() {
  try {
    console.log('[MIGRATION] Starting database migration for users table...');

    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
    `);

    // For existing users before this update, we should set them to verified
    // so they aren't locked out immediately.
    await pool.query(`
      UPDATE users
      SET email_verified = TRUE
      WHERE email_verified IS FALSE AND verification_token IS NULL;
    `);

    console.log('[MIGRATION] Users table updated successfully.');
  } catch (err) {
    console.error('[MIGRATION] Failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
