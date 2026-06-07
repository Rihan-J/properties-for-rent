/**
 * Geo utility functions — adapted from frontend/src/lib/geo.js
 *
 * - calculateDistance: direct copy (pure math)
 * - getGoogleMapsUrl: direct copy (returns URL string, opened via Linking on mobile)
 * - getWhatsAppUrl: direct copy
 * - getCurrentPosition: REMOVED — handled by GeoContext using expo-location
 */
import { Linking } from 'react-native';

/**
 * Calculates the great-circle distance between two points on Earth.
 * Returns distance in kilometers (string with 1 decimal).
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/**
 * Build Google Maps navigation URL
 */
export function getGoogleMapsUrl(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Build WhatsApp chat link
 */
export function getWhatsAppUrl(phone, message = '') {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export async function openUrl(url) {
  try {
    await Linking.openURL(url);
  } catch (err) {
    console.warn('Failed to open URL:', url, err);
  }
}

/**
 * Open directions in Google Maps / device maps
 */
export function openDirections(lat, lng) {
  const url = getGoogleMapsUrl(lat, lng);
  if (url) openUrl(url);
}

/**
 * Open WhatsApp chat
 */
export function openWhatsApp(phone, message = '') {
  const url = getWhatsAppUrl(phone, message);
  if (url) openUrl(url);
}

/**
 * Make a phone call
 */
export function openPhone(phone) {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone) openUrl(`tel:${cleanPhone}`);
}

/**
 * Open email client
 */
export function openEmail(email) {
  if (!email) return;
  openUrl(`mailto:${email}`);
}

/**
 * Open Instagram profile
 */
export function openInstagram(handle) {
  if (!handle) return;
  const cleanHandle = handle.replace(/^@/, '');
  if (cleanHandle) openUrl(`https://instagram.com/${cleanHandle}`);
}
