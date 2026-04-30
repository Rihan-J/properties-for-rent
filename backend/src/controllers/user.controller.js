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

    // 2. Collect image URLs for async cleanup before the DB cascading delete happens
    if (user.role === 'owner') {
      const propsResult = await client.query(
        'SELECT image_url FROM properties WHERE owner_id = $1',
        [userId]
      );
      imageUrls = propsResult.rows
        .filter(p => p.image_url)
        .map(p => p.image_url);
    }

    // 3. Delete the user (this will CASCADE to properties and reviews)
    // Extra safety: do not allow admin accounts to be deleted via this route
    const deleteResult = await client.query(`
      DELETE FROM users
      WHERE id = $1 AND role != 'admin'
    `, [userId]);

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return fail(res, 'Could not delete user. Note: Admin accounts cannot be deleted.', 403);
    }

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
