/**
 * App-wide constants. Single source of truth for categories, map defaults, etc.
 */

// Map provider is configurable — change to 'google' when ready
export const MAP_PROVIDER = null; // null = default provider per platform

export const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };
export const DEFAULT_ZOOM_DELTA = { latitudeDelta: 0.04, longitudeDelta: 0.04 };

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏘️' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'room', label: 'Room', icon: '🛏️' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'pg', label: 'PG', icon: '🧑‍🎓' },
  { id: 'lodge', label: 'Lodge', icon: '🏨' },
  { id: 'site', label: 'Site / Plot', icon: '🌍' },
];

export const BOOKING_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'hourly', label: 'Hourly' },
  { id: 'daily', label: 'Daily' },
];

export const RADIUS_OPTIONS = [2, 5, 10, 20, 50, 100];

export const RADIUS_TO_DELTA = {
  2: { latitudeDelta: 0.02, longitudeDelta: 0.02 },
  5: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
  10: { latitudeDelta: 0.1, longitudeDelta: 0.1 },
  20: { latitudeDelta: 0.2, longitudeDelta: 0.2 },
  50: { latitudeDelta: 0.5, longitudeDelta: 0.5 },
  100: { latitudeDelta: 1.0, longitudeDelta: 1.0 },
};

export const STORAGE_KEYS = {
  TOKEN: 'pfr_token',
  USER: 'pfr_user',
  // Future: cached data keys for offline support
  CACHED_PROPERTIES: 'pfr_cached_properties',
  CACHED_SUPPORT: 'pfr_cached_support',
};

export const DEBOUNCE_MS = 350;
export const API_TIMEOUT = 15000;
export const ITEMS_PER_PAGE = 20;
export const NEARBY_LIMIT = 50;
