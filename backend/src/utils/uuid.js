/**
 * UUID v4 format validator.
 * Prevents malformed IDs from reaching PostgreSQL (avoids 500 errors + info leaks).
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str) {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

module.exports = { isValidUUID };
