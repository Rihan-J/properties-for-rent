/**
 * Standardized API response helper.
 * Every response from this API follows this format.
 */

function success(res, data, statusCode = 200, meta = null) {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = { success, fail };
