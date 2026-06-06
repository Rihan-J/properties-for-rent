/**
 * Cloudinary helpers — adapted from frontend/src/lib/cloudinary.js
 *
 * Uses the existing backend upload proxy (POST /upload).
 * The mobile version sends file URI from expo-image-picker as FormData.
 */
import api from '../config/api';

/**
 * Upload an image via the backend proxy.
 * Accepts a file object from expo-image-picker: { uri, type, name }
 * Returns the secure_url of the uploaded image.
 */
export async function uploadImage(file) {
  if (!file || !file.uri) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.name || 'photo.jpg',
  });

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Longer timeout for image uploads
    });

    if (response.data && response.data.url) {
      return response.data.url;
    }
    throw new Error('Invalid response from upload server');
  } catch (error) {
    const errorMsg =
      error.response?.data?.error || error.message || 'Image upload failed';
    throw new Error(errorMsg);
  }
}

/**
 * Adds Cloudinary-style optimization query params.
 * Direct copy from web — pure URL manipulation, no DOM deps.
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
