const pool = require('../config/db');
const { success, fail } = require('../utils/response');

// ─── Get Support Info (Public) ──────────────────────────

async function getSupportInfo(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT email, phone, whatsapp, instagram, updated_at FROM support_info ORDER BY id LIMIT 1'
    );

    if (result.rows.length === 0) {
      return fail(res, 'Support info not configured', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ─── Update Support Info (Admin Only) ───────────────────

async function updateSupportInfo(req, res, next) {
  try {
    const { email, phone, whatsapp, instagram } = req.body;

    // Validate at least one field is provided
    if (!email && !phone && !whatsapp && !instagram) {
      return fail(res, 'At least one contact field is required', 400);
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, 'Invalid email format', 400);
    }

    // Validate phone format if provided
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      return fail(res, 'Phone must be a valid 10-15 digit number', 400);
    }

    // Validate whatsapp format if provided
    if (whatsapp && !/^\+?[0-9]{10,15}$/.test(whatsapp)) {
      return fail(res, 'WhatsApp number must be a valid 10-15 digit number', 400);
    }

    // Upsert: update the first row or insert if none exists
    const existing = await pool.query('SELECT id FROM support_info ORDER BY id LIMIT 1');

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE support_info
         SET email = COALESCE($1, email),
             phone = COALESCE($2, phone),
             whatsapp = COALESCE($3, whatsapp),
             instagram = COALESCE($4, instagram),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING email, phone, whatsapp, instagram, updated_at`,
        [email || null, phone || null, whatsapp || null, instagram || null, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO support_info (email, phone, whatsapp, instagram)
         VALUES ($1, $2, $3, $4)
         RETURNING email, phone, whatsapp, instagram, updated_at`,
        [email || null, phone || null, whatsapp || null, instagram || null]
      );
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSupportInfo, updateSupportInfo };
