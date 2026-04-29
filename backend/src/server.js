const env = require('./config/env'); // Validates env vars — must be first import
const app = require('./app');
const pool = require('./config/db');

const PORT = env.PORT;

async function start() {
  try {
    // Verify database connection before accepting requests
    const result = await pool.query('SELECT NOW()');
    console.log(`[DB] Connected to PostgreSQL at ${result.rows[0].now}`);

    app.listen(PORT, () => {
      console.log(`[SERVER] Properties for Rentz API running on port ${PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('[FATAL] Failed to connect to database:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received. Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SERVER] SIGINT received. Shutting down...');
  await pool.end();
  process.exit(0);
});

start();
