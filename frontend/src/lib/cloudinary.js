const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary using unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadImage(file) {
  // Debug: log env vars (values are public, safe to log in dev)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Cloudinary] Cloud name:', CLOUD_NAME);
    console.log('[Cloudinary] Upload preset:', UPLOAD_PRESET);
  }

  if (!CLOUD_NAME) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
  }
  if (!UPLOAD_PRESET || UPLOAD_PRESET === 'your_unsigned_preset') {
    throw new Error(
      'Invalid NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET — please set a real unsigned preset name in .env.local. ' +
      'Go to Cloudinary Dashboard → Settings → Upload → Add Upload Preset → Set signing mode to "Unsigned".'
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
    // Parse Cloudinary error response for a useful message
    let errorMsg = `Image upload failed (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message || errorMsg;
      console.error('[Cloudinary] Upload error:', errData);
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.secure_url;
}
