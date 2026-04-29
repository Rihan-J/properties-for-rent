const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { isValidUUID } = require('../utils/uuid');

// ─── Create Review ──────────────────────────────────────
async function createReview(req, res, next) {
  try {
    const userId = req.user.id;
    const { property_id, rating, comment } = req.body;

    // Validate inputs
    if (!property_id || !isValidUUID(property_id)) return fail(res, 'Valid property ID is required', 400);
    if (!rating || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return fail(res, 'Rating must be an integer between 1 and 5', 400);
    }
    if (comment && typeof comment === 'string' && comment.trim().length > 1000) {
      return fail(res, 'Comment must be under 1000 characters', 400);
    }

    // Verify property exists
    const propCheck = await pool.query('SELECT id FROM properties WHERE id = $1', [property_id]);
    if (propCheck.rows.length === 0) return fail(res, 'Property not found', 404);

    // Check if user already reviewed this property
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND property_id = $2',
      [userId, property_id]
    );
    if (existing.rows.length > 0) {
      return fail(res, 'You have already reviewed this property', 409);
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, property_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, property_id, rating, comment, created_at`,
      [userId, property_id, Number(rating), comment ? comment.trim() : null]
    );

    // Fetch user name for immediate display
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const review = {
      ...result.rows[0],
      user_name: userRes.rows[0]?.name || 'Anonymous',
    };

    return success(res, { review }, 201);
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      return fail(res, 'You have already reviewed this property', 409);
    }
    next(err);
  }
}

// ─── Get Reviews for Property ───────────────────────────
async function getPropertyReviews(req, res, next) {
  try {
    const { propertyId } = req.params;
    if (!isValidUUID(propertyId)) return fail(res, 'Invalid property ID', 400);

    const result = await pool.query(
      `SELECT
         r.id, r.rating, r.comment, r.created_at,
         u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.property_id = $1
       ORDER BY r.created_at DESC`,
      [propertyId]
    );

    // Compute aggregate stats
    const reviews = result.rows;
    const count = reviews.length;
    const avgRating = count > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

    return success(res, { reviews, stats: { count, avgRating } });
  } catch (err) {
    next(err);
  }
}

// ─── Delete Review (admin only) ─────────────────────────
async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) return fail(res, 'Invalid review ID', 400);

    const existing = await pool.query('SELECT id FROM reviews WHERE id = $1', [id]);
    if (existing.rows.length === 0) return fail(res, 'Review not found', 404);

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    return success(res, { message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Get All Reviews (admin) ────────────────────────────
async function getAllReviews(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM reviews');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT
         r.id, r.rating, r.comment, r.created_at,
         u.name AS user_name, u.email AS user_email,
         p.title AS property_title, p.id AS property_id
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN properties p ON p.id = r.property_id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return success(res, { reviews: result.rows }, 200, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, getPropertyReviews, deleteReview, getAllReviews };
