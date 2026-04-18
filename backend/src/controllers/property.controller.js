const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { deleteImage } = require('../utils/cloudinary');
const {
  validateProperty,
  validateNearbyQuery,
  validatePagination,
} = require('../validators');

// ─── Create Property (Owner only) ───────────────────────

async function createProperty(req, res, next) {
  try {
    const { valid, errors } = validateProperty(req.body);
    if (!valid) return fail(res, errors.join(', '), 400);

    let { category, title, description, price, latitude, longitude, image_url, phone, dimensions, area_sqft, price_per_sqft, total_price, municipal_status, revenue_type } = req.body;
    const owner_id = req.user.id;

    // auto calculation
    if (area_sqft && price_per_sqft) {
      total_price = Number(area_sqft) * Number(price_per_sqft);
    }

    // Handle optional phone insertion if user doesn't have one
    const userRes = await pool.query('SELECT phone FROM users WHERE id = $1', [owner_id]);
    let currentPhone = userRes.rows[0].phone;

    if (!currentPhone && !phone) {
      return fail(res, 'Phone number required to list property', 400);
    }
    if (!currentPhone && phone) {
      await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [phone.trim(), owner_id]);
    }

    const result = await pool.query(
      `INSERT INTO properties (owner_id, title, description, price, latitude, longitude, image_url, dimensions, area_sqft, price_per_sqft, total_price, municipal_status, revenue_type, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, owner_id, title, description, price, latitude, longitude, image_url, status, created_at, dimensions, area_sqft, price_per_sqft, total_price, municipal_status, revenue_type, category`,
      [owner_id, title.trim(), description ? description.trim() : null, price, latitude, longitude, image_url, dimensions || null, area_sqft || null, price_per_sqft || null, total_price || null, municipal_status || null, revenue_type || null, category || null]
    );

    return success(res, { property: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
}

// ─── Get Properties (Paginated + Category Filter) ───────
// Global safety rule: non-admin "site" listings NEVER appear.

async function getProperties(req, res, next) {
  try {
    const user = req.user;
    const { page, limit, offset } = validatePagination(req.query);
    const category = req.query.category || null; // e.g. "home", "site", null = all

    const VALID_CATEGORIES = ['home', 'room', 'shop', 'pg', 'site'];

    // ── Build dynamic WHERE clauses ──
    const conditions = [];
    const countConditions = [];
    const params = [];
    const countParams = [];
    let paramIndex = 1;
    let countParamIndex = 1;

    // 1. Scope: admin sees all, owner sees own
    if (user.role !== 'admin') {
      conditions.push(`p.owner_id = $${paramIndex++}`);
      params.push(user.id);
      countConditions.push(`p.owner_id = $${countParamIndex++}`);
      countParams.push(user.id);
    }

    // 2. Global safety: non-admin site listings NEVER appear
    conditions.push(`(p.category != 'site' OR u.role = 'admin')`);
    countConditions.push(`(p.category != 'site' OR u.role = 'admin')`);

    // 3. Category filter
    if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
      if (category === 'site') {
        // Extra enforcement: only admin-created sites
        conditions.push(`p.category = 'site' AND u.role = 'admin'`);
        countConditions.push(`p.category = 'site' AND u.role = 'admin'`);
      } else {
        conditions.push(`p.category = $${paramIndex++}`);
        params.push(category);
        countConditions.push(`p.category = $${countParamIndex++}`);
        countParams.push(category);
      }
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';
    const countWhereClause = countConditions.length > 0
      ? 'WHERE ' + countConditions.join(' AND ')
      : '';

    // ── Count query ──
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties p JOIN users u ON u.id = p.owner_id ${countWhereClause}`,
      countParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // ── Data query ──
    params.push(limit, offset);
    const limitParam = paramIndex++;
    const offsetParam = paramIndex++;

    const result = await pool.query(
      `SELECT p.id, p.owner_id, p.title, p.description, p.price, p.latitude, p.longitude,
              p.image_url, p.status, p.created_at, p.dimensions, p.area_sqft, p.price_per_sqft,
              p.total_price, p.municipal_status, p.revenue_type, p.category,
              u.phone AS owner_phone, u.role AS owner_role
       FROM properties p
       JOIN users u ON u.id = p.owner_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    return success(res, { properties: result.rows }, 200, {
      page, limit, total, totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
}

// ─── Get Nearby Properties (Bounding Box + Haversine) ───

async function getNearbyProperties(req, res, next) {
  try {
    const { valid, errors } = validateNearbyQuery(req.query);
    if (!valid) return fail(res, errors.join(', '), 400);

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius) || 5;
    const category = req.query.category || null;
    const { page, limit, offset } = validatePagination(req.query);

    // ── Bounding box calculation ──
    // 1 degree of latitude ≈ 111.045 km
    // 1 degree of longitude ≈ 111.045 * cos(latitude) km
    const latDelta = radiusKm / 111.045;
    const lngDelta = radiusKm / (111.045 * Math.cos(lat * (Math.PI / 180)));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // ── Optimized query using CTE ──
    // Step 1: Bounding box filter (uses idx_properties_lat_lng index)
    // Step 2: Haversine distance calculated ONCE in the CTE
    // Step 3: Filter by exact radius and paginate
    const result = await pool.query(
      `WITH nearby AS (
        SELECT
          p.id, p.owner_id, p.title, p.description, p.price, p.latitude, p.longitude, p.image_url, p.status, p.created_at, p.dimensions, p.area_sqft, p.price_per_sqft, p.total_price, p.municipal_status, p.revenue_type, p.category, u.phone AS owner_phone, u.role AS owner_role,
          (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians($1)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(p.latitude))
              ))
            )
          ) AS distance_km
        FROM properties p
        JOIN users u ON u.id = p.owner_id
        WHERE p.status = 'approved'
          AND p.latitude  BETWEEN $3 AND $4
          AND p.longitude BETWEEN $5 AND $6
          AND (p.category != 'site' OR u.role = 'admin')
          AND (
            $10::text IS NULL 
            OR (
              $10::text = 'site' AND p.category = 'site' AND u.role = 'admin'
            )
            OR (
              $10::text != 'site' AND p.category = $10
            )
          )
      )
      SELECT * FROM nearby
      WHERE distance_km <= $7
      ORDER BY distance_km ASC
      LIMIT $8 OFFSET $9`,
      [lat, lng, minLat, maxLat, minLng, maxLng, radiusKm, limit, offset, category]
    );

    // Count total results for pagination (within the same bounding box + radius)
    const countResult = await pool.query(
      `WITH nearby AS (
        SELECT
          (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians($1)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(p.latitude))
              ))
            )
          ) AS distance_km
        FROM properties p
        JOIN users u ON u.id = p.owner_id
        WHERE p.status = 'approved'
          AND p.latitude  BETWEEN $3 AND $4
          AND p.longitude BETWEEN $5 AND $6
          AND (p.category != 'site' OR u.role = 'admin')
          AND (
            $8::text IS NULL 
            OR (
              $8::text = 'site' AND p.category = 'site' AND u.role = 'admin'
            )
            OR (
              $8::text != 'site' AND p.category = $8
            )
          )
      )
      SELECT COUNT(*) FROM nearby WHERE distance_km <= $7`,
      [lat, lng, minLat, maxLat, minLng, maxLng, radiusKm, category]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    return success(res, { properties: result.rows }, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      center: { lat, lng },
      radiusKm,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Get Property by ID ─────────────────────────────────

async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        p.id, p.owner_id, p.title, p.description, p.price, p.latitude, p.longitude,
        p.image_url, p.status, p.created_at, p.dimensions, p.area_sqft, p.price_per_sqft, p.total_price, p.municipal_status, p.revenue_type, p.category,
        u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
       FROM properties p
       JOIN users u ON u.id = p.owner_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return fail(res, 'Property not found', 404);
    }

    return success(res, { property: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─── Delete Property (Owner: own only, Admin: any) ──────

async function deleteProperty(req, res, next) {
  try {
    const { id } = req.params;

    // Check property exists and fetch image_url for Cloudinary cleanup
    const existing = await pool.query(
      'SELECT id, owner_id, image_url FROM properties WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return fail(res, 'Property not found', 404);
    }

    // Owners can only delete their own properties
    const property = existing.rows[0];
    if (req.user.role !== 'admin' && property.owner_id !== req.user.id) {
      return fail(res, 'You can only delete your own properties', 403);
    }

    // Delete image from Cloudinary (fault-tolerant — won't block DB deletion)
    if (property.image_url) {
      await deleteImage(property.image_url);
    }

    await pool.query('DELETE FROM properties WHERE id = $1', [id]);

    return success(res, { message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  deleteProperty,
};
