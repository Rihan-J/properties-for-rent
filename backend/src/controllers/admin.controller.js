const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { validatePagination } = require('../validators');
const { deleteImage } = require('../utils/cloudinary');
const { invalidatePropertyCaches } = require('../middleware/cache');

// ─── Get All Properties (any status) ────────────────────

async function getAllProperties(req, res, next) {
  try {
    const { page, limit, offset } = validatePagination(req.query);

    const countResult = await pool.query('SELECT COUNT(*) FROM properties');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT
        p.id, p.owner_id, p.title, p.price, p.latitude, p.longitude,
        p.image_url, p.status, p.created_at, p.category,
        u.name AS owner_name, u.email AS owner_email
       FROM properties p
       JOIN users u ON u.id = p.owner_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return success(res, { properties: result.rows }, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ─── Approve Property ───────────────────────────────────

async function approveProperty(req, res, next) {
  try {
    const { id } = req.params;

    // Validate property exists
    const existing = await pool.query(
      'SELECT id, status FROM properties WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return fail(res, 'Property not found', 404);
    }
    if (existing.rows[0].status === 'approved') {
      return fail(res, 'Property is already approved', 400);
    }

    const result = await pool.query(
      `UPDATE properties SET status = 'approved'
       WHERE id = $1
       RETURNING id, owner_id, title, price, latitude, longitude, image_url, status, created_at`,
      [id]
    );

    invalidatePropertyCaches();
    return success(res, { property: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─── Delete Property ────────────────────────────────────

async function deleteProperty(req, res, next) {
  try {
    const { id } = req.params;

    // Validate property exists and fetch image_url for Cloudinary cleanup
    const existing = await pool.query(
      'SELECT id, image_url FROM properties WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return fail(res, 'Property not found', 404);
    }

    // Delete image from Cloudinary (fault-tolerant — won't block DB deletion)
    const property = existing.rows[0];
    if (property.image_url) {
      await deleteImage(property.image_url);
    }

    await pool.query('DELETE FROM properties WHERE id = $1', [id]);

    invalidatePropertyCaches();
    return success(res, { message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllProperties, approveProperty, deleteProperty };
