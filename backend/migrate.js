const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ys1LSTpgomF9@ep-mute-hall-amqm70ah-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  try {
    await client.connect();
    await client.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale'))");
    console.log('Migration done');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
