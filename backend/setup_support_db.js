require('dotenv').config(); // Load env variables first
const pool = require('./src/config/db');

async function setupDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_info (
        id SERIAL PRIMARY KEY,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        instagram TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      INSERT INTO support_info (email, phone, whatsapp, instagram)
      SELECT
        'support@propertiesforrentz.com',
        '9876543210',
        '9876543210',
        'https://instagram.com/propertiesforrentz'
      WHERE NOT EXISTS (SELECT 1 FROM support_info);
    `);
    console.log('Support info table setup successfully');
  } catch (err) {
    console.error('Error setting up DB:', err);
  } finally {
    await pool.end();
  }
}

setupDB();
