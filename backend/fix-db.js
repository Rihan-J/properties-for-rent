const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ys1LSTpgomF9@ep-mute-hall-amqm70ah-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  const res = await client.query("UPDATE properties SET listing_type = 'sale' WHERE title = '30*60' RETURNING id, title, listing_type");
  console.log('Updated:', res.rows);
  
  // Update any other obvious sales
  const res2 = await client.query("UPDATE properties SET listing_type = 'sale' WHERE price > 500000 RETURNING id, title, listing_type, price");
  console.log('Bulk updated high price properties:', res2.rows);

  await client.end();
}
run();
