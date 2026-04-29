const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { validatePagination } = require('../validators');
const { deleteImage } = require('../utils/cloudinary');
const { invalidatePropertyCaches } = require('../middleware/cache');
const { isValidUUID } = require('../utils/uuid');

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
    if (!isValidUUID(id)) return fail(res, 'Invalid property ID', 400);

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
    if (!isValidUUID(id)) return fail(res, 'Invalid property ID', 400);
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

// ─── Get Owner Details (user + their properties) ────────

async function getOwnerDetails(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) return fail(res, 'Invalid user ID', 400);

    // Fetch user info
    const userResult = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) {
      return fail(res, 'User not found', 404);
    }

    const user = userResult.rows[0];

    // Fetch their properties
    const propsResult = await pool.query(
      `SELECT id, title, price, image_url, status, category, created_at
       FROM properties
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Compute stats
    const properties = propsResult.rows;
    const totalProperties = properties.length;
    const approvedCount = properties.filter(p => p.status === 'approved').length;
    const pendingCount = properties.filter(p => p.status === 'pending').length;
    const rejectedCount = properties.filter(p => p.status === 'rejected').length;

    return success(res, {
      user,
      properties,
      stats: { totalProperties, approvedCount, pendingCount, rejectedCount },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Admin Stats (Analytics) ────────────────────────────

async function getAdminStats(req, res, next) {
  try {
    // Single query for user counts by role
    const usersResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'user') AS total_users,
        COUNT(*) FILTER (WHERE role = 'owner') AS total_owners
      FROM users
    `);

    // Total properties + category breakdown in one query
    const propsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE category = 'home') AS home,
        COUNT(*) FILTER (WHERE category = 'room') AS room,
        COUNT(*) FILTER (WHERE category = 'shop') AS shop,
        COUNT(*) FILTER (WHERE category = 'pg') AS pg,
        COUNT(*) FILTER (WHERE category = 'lodge') AS lodge,
        COUNT(*) FILTER (WHERE category = 'site') AS site
      FROM properties
    `);

    // Category breakdown as array for charts
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*)::int AS count
      FROM properties
      GROUP BY category
      ORDER BY count DESC
    `);

    const users = usersResult.rows[0];
    const props = propsResult.rows[0];

    return success(res, {
      totalUsers: parseInt(users.total_users, 10),
      totalOwners: parseInt(users.total_owners, 10),
      totalProperties: parseInt(props.total, 10),
      categories: categoryResult.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllProperties, approveProperty, deleteProperty, getOwnerDetails, getAdminStats };
