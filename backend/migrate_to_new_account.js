/**
 * Full Migration Script: Old Neon DB + Cloudinary → New Accounts
 * 
 * This script:
 * 1. Creates the schema on the new DB (from database.sql)
 * 2. Copies all data: users → properties → reviews → settings
 * 3. Migrates Cloudinary images from old account to new account
 * 4. Updates image_url references in the new DB
 * 
 * Usage:  node migrate_to_new_account.js
 */

const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── Connection Strings ─────────────────────────────────────
const OLD_DB_URL = 'postgresql://neondb_owner:npg_0mc4gFYueopz@ep-fancy-shape-a458gdc4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const NEW_DB_URL = 'postgresql://neondb_owner:npg_ys1LSTpgomF9@ep-mute-hall-amqm70ah-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

// ─── Cloudinary Configs ─────────────────────────────────────
const OLD_CLOUDINARY = {
  cloud_name: 'dftcnccer',
  api_key: '431878442119442',
  api_secret: 'U33_BftweRzj3maqdo4BO5NP-Gc',
};

const NEW_CLOUDINARY = {
  cloud_name: 'duyy9olys',
  api_key: '923575875988859',
  api_secret: 'o7AXAZBTdrK4NSMeLudMNmZUei8',
};

// ─── Database Pools ─────────────────────────────────────────
const oldPool = new Pool({
  connectionString: OLD_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

const newPool = new Pool({
  connectionString: NEW_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

// ─── Helpers ────────────────────────────────────────────────

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Step 1: Create Schema on New DB ────────────────────────

async function createSchema() {
  log('📐', 'Creating schema on new database...');

  const schemaSQL = fs.readFileSync(
    path.join(__dirname, 'database.sql'),
    'utf8'
  );

  // Remove the EXPLAIN ANALYZE block (it's a verification query, not schema)
  const cleanSQL = schemaSQL
    .split('\n')
    .filter((line) => !line.startsWith('EXPLAIN ANALYZE'))
    .join('\n')
    // Remove the entire EXPLAIN ANALYZE...LIMIT block
    .replace(/EXPLAIN ANALYZE[\s\S]*?LIMIT 50 OFFSET 0;/g, '');

  await newPool.query(cleanSQL);
  log('✅', 'Schema created successfully on new DB');
}

// ─── Step 2: Migrate Data ───────────────────────────────────

async function migrateData() {
  log('📦', 'Starting data migration...');

  // 2a. Migrate Users
  log('👤', 'Migrating users...');
  const { rows: users } = await oldPool.query('SELECT * FROM users ORDER BY created_at ASC');
  log('📊', `Found ${users.length} users in old DB`);

  for (const user of users) {
    try {
      await newPool.query(
        `INSERT INTO users (id, name, email, password, phone, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.name, user.email, user.password, user.phone, user.role, user.created_at]
      );
    } catch (err) {
      // Handle email uniqueness conflicts
      if (err.code === '23505') {
        log('⚠️', `  Skipping duplicate user: ${user.email}`);
      } else {
        throw err;
      }
    }
  }
  log('✅', `Migrated ${users.length} users`);

  // 2b. Migrate Properties (image_url will be updated later by Cloudinary migration)
  log('🏠', 'Migrating properties...');
  const { rows: properties } = await oldPool.query('SELECT * FROM properties ORDER BY created_at ASC');
  log('📊', `Found ${properties.length} properties in old DB`);

  for (const p of properties) {
    try {
      await newPool.query(
        `INSERT INTO properties (
           id, owner_id, title, description, price, latitude, longitude,
           image_url, status, category, booking_type, price_per_hour,
           price_per_day, dimensions, area_sqft, price_per_sqft,
           total_price, municipal_status, revenue_type, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id, p.owner_id, p.title, p.description, p.price,
          p.latitude, p.longitude, p.image_url, p.status,
          p.category, p.booking_type, p.price_per_hour, p.price_per_day,
          p.dimensions, p.area_sqft, p.price_per_sqft, p.total_price,
          p.municipal_status, p.revenue_type, p.created_at,
        ]
      );
    } catch (err) {
      log('❌', `  Failed to migrate property "${p.title}": ${err.message}`);
    }
  }
  log('✅', `Migrated ${properties.length} properties`);

  // 2c. Migrate Reviews
  log('⭐', 'Migrating reviews...');
  try {
    const { rows: reviews } = await oldPool.query('SELECT * FROM reviews ORDER BY created_at ASC');
    log('📊', `Found ${reviews.length} reviews in old DB`);

    for (const r of reviews) {
      try {
        await newPool.query(
          `INSERT INTO reviews (id, user_id, property_id, rating, comment, created_at)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, r.user_id, r.property_id, r.rating, r.comment, r.created_at]
        );
      } catch (err) {
        log('⚠️', `  Skipping review ${r.id}: ${err.message}`);
      }
    }
    log('✅', `Migrated ${reviews.length} reviews`);
  } catch (err) {
    log('⚠️', `Reviews table may not exist in old DB: ${err.message}`);
  }

  // 2d. Migrate Settings
  log('⚙️', 'Migrating settings...');
  try {
    const { rows: settings } = await oldPool.query('SELECT * FROM settings');
    for (const s of settings) {
      await newPool.query(
        `INSERT INTO settings (id, brand_name, brand_initials, brand_tagline)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET
           brand_name = EXCLUDED.brand_name,
           brand_initials = EXCLUDED.brand_initials,
           brand_tagline = EXCLUDED.brand_tagline`,
        [s.id, s.brand_name, s.brand_initials, s.brand_tagline]
      );
    }
    log('✅', `Migrated ${settings.length} settings rows`);
  } catch (err) {
    log('⚠️', `Settings table may not exist: ${err.message}`);
  }
}

// ─── Step 3: Migrate Cloudinary Images ──────────────────────

async function migrateCloudinaryImages() {
  log('☁️', 'Starting Cloudinary image migration...');

  // Configure new Cloudinary for uploads
  cloudinary.config(NEW_CLOUDINARY);

  // Get all properties with image URLs from old Cloudinary
  const { rows: properties } = await newPool.query(
    `SELECT id, image_url FROM properties WHERE image_url IS NOT NULL AND image_url != ''`
  );

  const oldCloudName = OLD_CLOUDINARY.cloud_name;
  const toMigrate = properties.filter(
    (p) => p.image_url && p.image_url.includes(oldCloudName)
  );

  log('📊', `Found ${toMigrate.length} images to migrate (out of ${properties.length} total)`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toMigrate.length; i++) {
    const { id, image_url } = toMigrate[i];
    log('🔄', `  [${i + 1}/${toMigrate.length}] Migrating image for property ${id}...`);

    try {
      // Download from old Cloudinary
      const imageBuffer = await downloadImage(image_url);

      // Upload to new Cloudinary
      const b64 = imageBuffer.toString('base64');
      // Detect mime type from URL extension or default to jpeg
      const ext = path.extname(new URL(image_url).pathname).slice(1) || 'jpg';
      const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
      const mime = mimeMap[ext] || 'image/jpeg';
      const dataURI = `data:${mime};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'apna-stay',
      });

      // Update the image_url in new DB
      await newPool.query(
        'UPDATE properties SET image_url = $1 WHERE id = $2',
        [result.secure_url, id]
      );

      log('✅', `    → Uploaded: ${result.secure_url.substring(0, 80)}...`);
      success++;
    } catch (err) {
      log('❌', `    → Failed: ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  log('📊', `Cloudinary migration complete: ${success} succeeded, ${failed} failed`);
}

// ─── Step 4: Run Additional Migrations ──────────────────────

async function runMigrations() {
  log('🔧', 'Running additional migration scripts on new DB...');

  // Ensure all columns and indexes from migrate.js exist
  await newPool.query(`
    ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS category VARCHAR(30),
    ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
    ADD COLUMN IF NOT EXISTS area_sqft NUMERIC,
    ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
    ADD COLUMN IF NOT EXISTS total_price NUMERIC,
    ADD COLUMN IF NOT EXISTS municipal_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS revenue_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS price_per_hour NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(12, 2)
  `);

  await newPool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
  `);

  await newPool.query('CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties (latitude, longitude)');
  await newPool.query('CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status)');
  await newPool.query('CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category)');
  await newPool.query('CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc ON properties (created_at DESC)');

  log('✅', 'Additional migrations applied');
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  APNA STAY — Full Account Migration Script');
  console.log('══════════════════════════════════════════════\n');

  try {
    // Test connections first
    log('🔌', 'Testing old DB connection...');
    const oldTest = await oldPool.query('SELECT NOW()');
    log('✅', `Old DB connected: ${oldTest.rows[0].now}`);

    log('🔌', 'Testing new DB connection...');
    const newTest = await newPool.query('SELECT NOW()');
    log('✅', `New DB connected: ${newTest.rows[0].now}`);

    // Step 1: Schema
    await createSchema();

    // Step 2: Data
    await migrateData();

    // Step 3: Migrations (ensure all columns exist before Cloudinary step)
    await runMigrations();

    // Step 4: Cloudinary Images
    await migrateCloudinaryImages();

    // Final verification
    log('🔍', 'Running verification...');
    const userCount = await newPool.query('SELECT COUNT(*) FROM users');
    const propCount = await newPool.query('SELECT COUNT(*) FROM properties');
    const reviewCount = await newPool.query('SELECT COUNT(*) FROM reviews');

    console.log('\n══════════════════════════════════════════════');
    console.log('  Migration Complete!');
    console.log('══════════════════════════════════════════════');
    console.log(`  Users:      ${userCount.rows[0].count}`);
    console.log(`  Properties: ${propCount.rows[0].count}`);
    console.log(`  Reviews:    ${reviewCount.rows[0].count}`);
    console.log('══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n💥 MIGRATION FAILED:', err.message);
    console.error(err.stack);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

main();
