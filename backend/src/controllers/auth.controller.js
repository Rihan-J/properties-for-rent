const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { success, fail } = require('../utils/response');
const { validateRegister, validateLogin } = require('../validators');
const { sendVerificationEmail } = require('../utils/email');

// ─── Register ────────────────────────────────────────────

async function register(req, res, next) {
  try {

    const { valid, errors } = validateRegister(req.body);
    if (!valid) return fail(res, errors.join(', '), 400);

    const { name, email, password, role, phone, accepted_terms } = req.body;
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
    const userRole = 'user'; // All registrants are assigned the 'user' role
    const userPhone = phone ? phone.trim() : null;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, email_verified, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4, $5, true, NULL, NULL)
       RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, userRole, userPhone]
    );

    const user = result.rows[0];

    // Give them a token immediately
    const token = jwt.sign(
      { id: user.id, role: user.role, email_verified: true },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return success(res, {
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    }, 201);
  } catch (err) {
    // Race condition: another request inserted the same email between our check and insert
    if (err.code === '23505') {
      return fail(res, 'Email already registered', 409);
    }
    next(err);
  }
}

// ─── Verify Email ────────────────────────────────────────

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string' || token.length < 32) {
      return fail(res, 'Invalid verification link', 400);
    }

    // Find user with this token that hasn't expired
    const result = await pool.query(
      `SELECT id, name, email, role, phone, email_verified
       FROM users
       WHERE verification_token = $1
         AND verification_token_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return fail(res, 'Invalid or expired verification link. Please request a new one.', 400);
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return success(res, { message: 'Email is already verified. You can login.' });
    }

    // Mark email as verified and clear the token
    await pool.query(
      `UPDATE users
       SET email_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Issue JWT now that email is verified
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role, email_verified: true },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return success(res, {
      message: 'Email verified successfully!',
      token: jwtToken,
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

// ─── Resend Verification Email ───────────────────────────

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return fail(res, 'Email is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, name, email_verified FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Don't reveal whether the email exists — return success either way
      return success(res, { message: 'If an account exists with this email, a verification link has been sent.' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return success(res, { message: 'Email is already verified. You can login.' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET verification_token = $1,
           verification_token_expires = $2
       WHERE id = $3`,
      [verificationToken, verificationExpires, user.id]
    );

    await sendVerificationEmail(normalizedEmail, user.name, verificationToken);

    return success(res, { message: 'If an account exists with this email, a verification link has been sent.' });
  } catch (err) {
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
      'SELECT id, name, email, password, role, phone, email_verified FROM users WHERE email = $1',
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
      { id: user.id, role: user.role },
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

module.exports = { register, login, verifyEmail, resendVerification };
