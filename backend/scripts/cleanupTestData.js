/**
 * Production Cleanup Script
 * Deletes ALL non-admin users and their cascaded data (properties, reviews).
 * Also removes associated Cloudinary images.
 * 
 * RUN ONLY ONCE. Make sure you have a DB backup first.
 * 
 * Usage: node scripts/cleanupTestData.js
 */
require('dotenv').config();
const pool = require('../src/config/db');
const { deleteImage } = require('../src/utils/cloudinary');

async function cleanup() {
  const client = await pool.connect();

  try {
    // 1. Show what will be deleted
    const admins = await client.query("SELECT id, name, email FROM users WHERE role = 'admin'");
    const nonAdmins = await client.query("SELECT id, name, email, role FROM users WHERE role != 'admin'");
    const properties = await client.query(
      "SELECT id, title, image_url FROM properties WHERE owner_id IN (SELECT id FROM users WHERE role != 'admin')"
    );
    const reviews = await client.query(
      "SELECT COUNT(*) FROM reviews WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')"
    );

    console.log('\n========================================');
    console.log('  PRODUCTION CLEANUP — DRY RUN SUMMARY');
    console.log('========================================\n');
    console.log(`✅ KEEPING ${admins.rows.length} admin(s):`);
    admins.rows.forEach(a => console.log(`   - ${a.name} (${a.email})`));
    console.log(`\n🗑️  DELETING ${nonAdmins.rows.length} non-admin user(s):`);
    nonAdmins.rows.forEach(u => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));
    console.log(`🗑️  DELETING ${properties.rows.length} propert(ies)`);
    console.log(`🗑️  DELETING ${reviews.rows[0].count} review(s)`);
    console.log('\n========================================\n');

    if (nonAdmins.rows.length === 0) {
      console.log('Nothing to clean up. Only admin(s) exist.');
      return;
    }

    // 2. Clean up Cloudinary images first (before DB deletes)
    console.log('Cleaning Cloudinary images...');
    let cloudinaryDeleted = 0;
    for (const prop of properties.rows) {
      if (prop.image_url) {
        try {
          await deleteImage(prop.image_url);
          cloudinaryDeleted++;
        } catch (err) {
          console.warn(`  ⚠ Failed to delete image for "${prop.title}": ${err.message}`);
        }
      }
    }
    console.log(`  Cloudinary: ${cloudinaryDeleted}/${properties.rows.length} images deleted\n`);

    // 3. Delete users in a transaction (CASCADE handles properties + reviews)
    await client.query('BEGIN');

    const result = await client.query("DELETE FROM users WHERE role != 'admin'");

    await client.query('COMMIT');

    console.log(`✅ Deleted ${result.rowCount} user(s) (+ cascaded properties & reviews)`);

    // 4. Verify
    const remaining = await client.query('SELECT id, name, email, role FROM users');
    console.log(`\n📋 Remaining users (${remaining.rows.length}):`);
    remaining.rows.forEach(u => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));
    console.log('\n✅ Cleanup complete!\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Cleanup failed — ROLLED BACK:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
