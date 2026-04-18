const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary using unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadImage(file) {
  if (!CLOUD_NAME) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
  }

  if (!UPLOAD_PRESET || UPLOAD_PRESET === 'your_unsigned_preset') {
    throw new Error(
      'Invalid NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. Set a real unsigned preset in .env.local.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'apna-stay');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    let errorMsg = `Image upload failed (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message || errorMsg;
    } catch {
      // ignore non-JSON error response
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Adds Cloudinary-style optimization query params without changing non-cloudinary URLs.
 */
export function getOptimizedImageUrl(url, { width = 500 } = {}) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('f_auto', 'true');
    parsed.searchParams.set('q_auto', 'true');
    parsed.searchParams.set('w', String(width));
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}f_auto,q_auto,w=${width}`;
  }
}
