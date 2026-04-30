require('dotenv').config();
const pool = require('../src/config/db');

async function runMigration() {
  console.log('Starting cascade delete migration...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Properties -> Users
    console.log('Updating properties table constraints...');
    await client.query(`
      ALTER TABLE properties 
      DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;
    `);
    
    await client.query(`
      ALTER TABLE properties 
      ADD CONSTRAINT properties_owner_id_fkey 
      FOREIGN KEY (owner_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE;
    `);

    // 2. Reviews -> Properties
    console.log('Updating reviews -> properties constraints...');
    await client.query(`
      ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS reviews_property_id_fkey;
    `);
    
    await client.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT reviews_property_id_fkey 
      FOREIGN KEY (property_id) 
      REFERENCES properties(id) 
      ON DELETE CASCADE;
    `);

    // 3. Reviews -> Users
    console.log('Updating reviews -> users constraints...');
    await client.query(`
      ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
    `);
    
    await client.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT reviews_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE;
    `);

    // The user also mentioned property_images, but looking at database.sql, 
    // there is no property_images table. The images are stored as a single `image_url` 
    // text column in the properties table. However, to be safe and strictly follow 
    // the user's instructions (which might be preemptive for a future table or referring 
    // to a different schema version), I will add an IF EXISTS block.

    console.log('Checking for property_images table...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'property_images'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Updating property_images -> properties constraints...');
      await client.query(`
        ALTER TABLE property_images 
        DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;
      `);
      
      await client.query(`
        ALTER TABLE property_images 
        ADD CONSTRAINT property_images_property_id_fkey 
        FOREIGN KEY (property_id) 
        REFERENCES properties(id) 
        ON DELETE CASCADE;
      `);
    } else {
      console.log('No property_images table found. Skipping.');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration();
