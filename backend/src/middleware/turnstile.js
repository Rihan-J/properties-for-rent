const { TURNSTILE_SECRET } = require('../config/env');
const { fail } = require('../utils/response');

/**
 * Cloudflare Turnstile server-side verification middleware.
 *
 * Reads `turnstile_token` from req.body, verifies it against the
 * canonical siteverify endpoint, and blocks with 403 on failure.
 * Strips the token from req.body so downstream validators don't choke.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
async function verifyTurnstile(req, res, next) {
  const token = req.body?.turnstile_token;

  if (!token || typeof token !== 'string') {
    return fail(res, 'Bot verification failed. Please try again.', 403);
  }

  // Strip the token so validators don't see it
  delete req.body.turnstile_token;

  const clientIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '';

  let result;
  try {
    const r = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
          remoteip: clientIp,
        }),
      }
    );
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch (err) {
    // Network error, non-2xx, or non-JSON body. Fail closed.
    console.error('[TURNSTILE] siteverify network error:', err.message);
    return fail(res, 'Bot verification failed. Please try again.', 403);
  }

  if (!result.success) {
    console.warn(
      '[TURNSTILE] Verification failed:',
      result['error-codes'] || 'unknown'
    );
    return fail(res, 'Bot verification failed. Please try again.', 403);
  }

  next();
}

module.exports = { verifyTurnstile };
