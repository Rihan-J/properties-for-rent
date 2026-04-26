const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { deleteImage } = require('../utils/cloudinary');
const { invalidatePropertyCaches } = require('../middleware/cache');

// ─── Delete Own Account ─────────────────────────────────

async function deleteMyAccount(req, res, next) {
  const client = await pool.connect();
  let imageUrls = []; // Collect for async cleanup after response

  try {
    const userId = req.user.id;


    await client.query('BEGIN');

    // 1. Fetch user to confirm existence
    const userResult = await client.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );


    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 'User not found', 404);
    }

    const user = userResult.rows[0];

    // 2. If the user is an owner, clean up their properties
    if (user.role === 'owner') {
      // Collect image URLs for async cleanup (don't block the transaction)
      const propsResult = await client.query(
        'SELECT id, image_url FROM properties WHERE owner_id = $1',
        [userId]
      );
      imageUrls = propsResult.rows
        .filter(p => p.image_url)
        .map(p => p.image_url);

      // Delete reviews on the user's properties
      await client.query(
        'DELETE FROM reviews WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1)',
        [userId]
      );

      // Delete properties
      await client.query('DELETE FROM properties WHERE owner_id = $1', [userId]);
    }

    // 3. Delete reviews written by this user
    await client.query('DELETE FROM reviews WHERE user_id = $1', [userId]);

    // 4. Delete the user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    // Invalidate caches since properties may have been removed
    invalidatePropertyCaches();

    // Send response FIRST, then clean up images async
    if (!res.headersSent) {
      success(res, { message: 'Account deleted successfully' });
    }

    // Fire-and-forget: clean up Cloudinary images after response
    if (imageUrls.length > 0) {
      Promise.allSettled(imageUrls.map(url => deleteImage(url)))
        .then(results => {
          const failed = results.filter(r => r.status === 'rejected');
          if (failed.length > 0) {
            console.warn(`[USER:DELETE] Failed to delete ${failed.length}/${imageUrls.length} images from Cloudinary`);
          }
        });
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (!res.headersSent) {
      next(err);
    }
  } finally {
    client.release();
  }
}

module.exports = { deleteMyAccount };
