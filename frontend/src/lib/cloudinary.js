import api from './api';

/**
 * Upload a file securely via our backend proxy.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.url) {
      return response.data.url;
    }
    throw new Error('Invalid response from upload server');
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || 'Image upload failed';
    throw new Error(errorMsg);
  }
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
