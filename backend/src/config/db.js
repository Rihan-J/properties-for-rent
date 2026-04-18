const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 15000,
  keepAlive: true,
});

const slowQueryMs = parseInt(process.env.SLOW_QUERY_MS, 10) || 500;
const originalQuery = pool.query.bind(pool);

pool.query = async (...args) => {
  const startedAt = Date.now();
  try {
    return await originalQuery(...args);
  } finally {
    const duration = Date.now() - startedAt;
    if (duration > slowQueryMs) {
      const queryText = typeof args[0] === 'string'
        ? args[0]
        : (args[0] && args[0].text) || 'unknown_query';
      console.warn(`[DB:SLOW] ${duration}ms ${queryText.replace(/\s+/g, ' ').slice(0, 220)}`);
    }
  }
};

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;
