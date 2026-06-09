const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { deleteImage } = require('../utils/cloudinary');
const {
  validateProperty,
  validateNearbyQuery,
  validatePagination,
} = require('../validators');
const { invalidatePropertyCaches } = require('../middleware/cache');
const { isValidUUID } = require('../utils/uuid');

async function createProperty(req, res, next) {
  try {
    const { valid, errors } = validateProperty(req.body);
    if (!valid) return fail(res, errors.join(', '), 400);

    let {
      category,
      title,
      description,
      price,
      booking_type,
      booking_types,
      price_per_hour,
      price_per_day,
      latitude,
      longitude,
      image_url,
      phone,
      dimensions,
      area_sqft,
      price_per_sqft,
      total_price,
      municipal_status,
      revenue_type,
    } = req.body;

    const owner_id = req.user.id;
    const isLodge = category === 'lodge';

    if (isLodge) {
      // Normalize: accept booking_types array OR legacy booking_type string
      const types = Array.isArray(booking_types) ? booking_types : (booking_type ? [booking_type] : []);
      const hasHourly = types.includes('hourly');
      const hasDaily = types.includes('daily');

      if (hasHourly && hasDaily) {
        booking_type = 'both';
        price = Math.min(Number(price_per_hour), Number(price_per_day));
      } else if (hasHourly) {
        booking_type = 'hourly';
        price = Number(price_per_hour);
        price_per_day = null;
      } else if (hasDaily) {
        booking_type = 'daily';
        price = Number(price_per_day);
        price_per_hour = null;
      }
    } else {
      booking_type = null;
      price_per_hour = null;
      price_per_day = null;
    }

    if (area_sqft && price_per_sqft) {
      total_price = Number(area_sqft) * Number(price_per_sqft);
    }

    const userRes = await pool.query('SELECT phone FROM users WHERE id = $1', [owner_id]);
    const currentPhone = userRes.rows[0].phone;

    if (!currentPhone && !phone) {
      return fail(res, 'Phone number required to list property', 400);
    }

    if (!currentPhone && phone) {
      await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [phone.trim(), owner_id]);
    }

    const result = await pool.query(
      `INSERT INTO properties (
         owner_id, title, description, price, latitude, longitude, image_url,
         dimensions, area_sqft, price_per_sqft, total_price,
         municipal_status, revenue_type, category, booking_type, price_per_hour, price_per_day
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id, owner_id, title, description, price, latitude, longitude, image_url,
                 status, created_at, dimensions, area_sqft, price_per_sqft, total_price,
                 municipal_status, revenue_type, category, booking_type, price_per_hour, price_per_day`,
      [
        owner_id,
        title.trim(),
        description ? description.trim() : null,
        price,
        latitude,
        longitude,
        image_url,
        dimensions || null,
        area_sqft || null,
        price_per_sqft || null,
        total_price || null,
        municipal_status || null,
        revenue_type || null,
        category || null,
        booking_type || null,
        price_per_hour || null,
        price_per_day || null,
      ]
    );

    invalidatePropertyCaches();
    return success(res, { property: result.rows[0] }, 201);
  } catch (err) {
    next(err);
  }
}

async function getProperties(req, res, next) {
  try {
    const user = req.user;
    const { page, limit, offset } = validatePagination(req.query);
    const category = req.query.category || null;
    const bookingType = req.query.booking_type || null;

    const VALID_CATEGORIES = ['home', 'room', 'shop', 'pg', 'site', 'lodge'];
    const VALID_BOOKING_TYPES = ['hourly', 'daily'];
    const normalizedBookingType = VALID_BOOKING_TYPES.includes(bookingType) ? bookingType : null;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (user.role !== 'admin') {
      conditions.push(`p.owner_id = $${paramIndex++}`);
      params.push(user.id);
    }

    if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
      conditions.push(`p.category = $${paramIndex++}`);
      params.push(category);
    }

    if (normalizedBookingType) {
      conditions.push(`p.category = 'lodge' AND (p.booking_type = $${paramIndex} OR p.booking_type = 'both')`);
      params.push(normalizedBookingType);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit, offset);
    const limitParam = paramIndex++;
    const offsetParam = paramIndex++;

    // Single query: data + total count via window function (eliminates one DB round-trip)
    const result = await pool.query(
      `SELECT
         p.id,
         p.owner_id,
         p.title,
         p.price,
         p.latitude AS lat,
         p.longitude AS lng,
         p.image_url,
         p.status,
         p.created_at,
         p.category,
         p.booking_type,
         p.price_per_hour,
         p.price_per_day,
         COUNT(*) OVER() AS _total_count
       FROM properties p
       JOIN users u ON u.id = p.owner_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    const total = result.rows.length > 0 ? parseInt(result.rows[0]._total_count, 10) : 0;
    // Strip the _total_count field from response rows
    const properties = result.rows.map(({ _total_count, ...rest }) => rest);

    return success(res, { properties }, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getNearbyProperties(req, res, next) {
  try {
    const { valid, errors } = validateNearbyQuery(req.query);
    if (!valid) return fail(res, errors.join(', '), 400);

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius) || 20;
    const category = req.query.category || null;
    const bookingType = req.query.booking_type || null;
    const VALID_BOOKING_TYPES = ['hourly', 'daily'];
    const normalizedBookingType = VALID_BOOKING_TYPES.includes(bookingType) ? bookingType : null;
    const { page, limit, offset } = validatePagination(req.query);

    const latDelta = radiusKm / 111.045;
    const lngDelta = radiusKm / (111.045 * Math.cos(lat * (Math.PI / 180)));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // Single query: data + total count via COUNT(*) OVER() (eliminates one full DB round-trip)
    const result = await pool.query(
      `WITH nearby AS (
        SELECT
          p.id,
          p.title,
          p.price,
          p.latitude AS lat,
          p.longitude AS lng,
          p.image_url,
          p.category,
          p.booking_type,
          p.price_per_hour,
          p.price_per_day,
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
          AND p.latitude BETWEEN $3 AND $4
          AND p.longitude BETWEEN $5 AND $6
          AND (
            $10::text IS NULL
            OR p.category = $10
          )
          AND (
            $11::text IS NULL
            OR (p.category = 'lodge' AND (p.booking_type = $11 OR p.booking_type = 'both'))
          )
      )
      SELECT id, title, price, lat, lng, image_url, category, booking_type, price_per_hour, price_per_day, distance_km,
             COUNT(*) OVER() AS _total_count
      FROM nearby
      WHERE distance_km <= $7
      ORDER BY distance_km ASC
      LIMIT $8 OFFSET $9`,
      [lat, lng, minLat, maxLat, minLng, maxLng, radiusKm, limit, offset, category, normalizedBookingType]
    );

    const total = result.rows.length > 0 ? parseInt(result.rows[0]._total_count, 10) : 0;
    // Strip the _total_count field from response rows
    const properties = result.rows.map(({ _total_count, ...rest }) => rest);

    return success(res, { properties }, 200, {
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

async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) return fail(res, 'Invalid property ID', 400);

    const result = await pool.query(
      `SELECT
         p.id,
         p.owner_id,
         p.title,
         p.description,
         p.price,
         p.latitude,
         p.longitude,
         p.image_url,
         p.status,
         p.created_at,
         p.dimensions,
         p.area_sqft,
         p.price_per_sqft,
         p.total_price,
         p.municipal_status,
         p.revenue_type,
         p.category,
         p.booking_type,
         p.price_per_hour,
         p.price_per_day,
         u.name AS owner_name,
         u.email AS owner_email,
         u.phone AS owner_phone
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

async function deleteProperty(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) return fail(res, 'Invalid property ID', 400);

    const existing = await pool.query(
      'SELECT id, owner_id, image_url FROM properties WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return fail(res, 'Property not found', 404);
    }

    const property = existing.rows[0];
    if (req.user.role !== 'admin' && property.owner_id !== req.user.id) {
      return fail(res, 'You can only delete your own properties', 403);
    }

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

module.exports = {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  deleteProperty,
};
