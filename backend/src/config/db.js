const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                       // Max connections in the pool
  idleTimeoutMillis: 30000,      // Close idle connections after 30s
  connectionTimeoutMillis: 15000, // Neon cold-start can take 5-10s
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;
