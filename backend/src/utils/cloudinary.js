const cloudinary = require('cloudinary').v2;
const env = require('../config/env');

// ─── Configure Cloudinary SDK ───────────────────────────
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Extract the public_id from a full Cloudinary URL.
 *
 * Example input:
 *   https://res.cloudinary.com/demo/image/upload/v1234567890/apna-stay/abc123.jpg
 * Returns:
 *   "apna-stay/abc123"
 *
 * Returns null if the URL doesn't look like a valid Cloudinary URL.
 */
function extractPublicId(imageUrl) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);

    // Cloudinary URLs follow the pattern:
    //   /image/upload/v<version>/<public_id>.<ext>
    const parts = url.pathname.split('/upload/');
    if (parts.length < 2) return null;

    // Remove the leading version segment (v1234567890/) and the file extension
    let afterUpload = parts[1];

    // Strip version prefix if present (e.g. "v1234567890/")
    afterUpload = afterUpload.replace(/^v\d+\//, '');

    // Strip file extension
    const lastDot = afterUpload.lastIndexOf('.');
    if (lastDot !== -1) {
      afterUpload = afterUpload.substring(0, lastDot);
    }

    return afterUpload || null;
  } catch {
    // URL parsing failed — not a valid URL
    return null;
  }
}

/**
 * Delete an image from Cloudinary by its full URL.
 * Safely handles errors — logs a warning but does NOT throw,
 * so the caller can still proceed with database cleanup.
 *
 * @param {string} imageUrl - The full Cloudinary image URL.
 * @returns {boolean} true if deleted successfully, false otherwise.
 */
async function deleteImage(imageUrl) {
  const publicId = extractPublicId(imageUrl);

  if (!publicId) {
    console.warn('[Cloudinary] Could not extract public_id from URL:', imageUrl);
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log(`[Cloudinary] Deleted image: ${publicId}`);
      return true;
    } else {
      // "not found" is common if image was already deleted manually
      console.warn(`[Cloudinary] Unexpected result for ${publicId}:`, result.result);
      return false;
    }
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
    return false;
  }
}

module.exports = { extractPublicId, deleteImage };
