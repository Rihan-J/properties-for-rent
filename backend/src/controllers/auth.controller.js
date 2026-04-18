const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { success, fail } = require('../utils/response');
const { validateRegister, validateLogin } = require('../validators');

// ─── Register ────────────────────────────────────────────

async function register(req, res, next) {
  try {
    const { valid, errors } = validateRegister(req.body);
    if (!valid) return fail(res, errors.join(', '), 400);

    const { name, email, password, role, phone } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists (avoid waiting for DB constraint error)
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return fail(res, 'Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'owner' ? 'owner' : 'user'; // Never allow 'admin' via API
    const userPhone = phone ? phone.trim() : null;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, userRole, userPhone]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return success(res, { token, user }, 201);
  } catch (err) {
    // Race condition: another request inserted the same email between our check and insert
    if (err.code === '23505') {
      return fail(res, 'Email already registered', 409);
    }
    next(err);
  }
}

// ─── Login ───────────────────────────────────────────────

async function login(req, res, next) {
  try {
    const { valid, errors } = validateLogin(req.body);
    if (!valid) return fail(res, errors.join(', '), 400);

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, name, email, password, role, phone FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return fail(res, 'Invalid email or password', 401);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return fail(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Never return the password hash
    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
