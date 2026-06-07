/**
 * Mobile API client — adapted from frontend/src/lib/api.js
 *
 * Key changes from web version:
 * - Uses EXPO_PUBLIC_API_URL instead of NEXT_PUBLIC_API_URL
 * - Token stored in AsyncStorage (not localStorage)
 * - 401 handler triggers navigation event instead of window.location redirect
 * - Same retry logic (429, 5xx) and request cancellation support
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_TIMEOUT } from './constants';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://properties-backend-kir0.onrender.com/api';



const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT,
});

// ─── Token management ──────────────────────────────────
let _cachedToken = null;

export async function loadToken() {
  try {
    _cachedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    _cachedToken = null;
  }
  return _cachedToken;
}

export function setToken(token) {
  _cachedToken = token;
}

export function getToken() {
  return _cachedToken;
}

// ─── Auth state clearing (wired up by AuthContext) ─────
export const clearAuthState = { current: null };

// ─── Navigation ref (wired up by RootNavigator) ───────
export const navigationRef = { current: null };

// ─── Request interceptor: inject auth token ───────────
api.interceptors.request.use((config) => {
  if (_cachedToken) {
    config.headers.Authorization = `Bearer ${_cachedToken}`;
  }
  return config;
});

// ─── Retry logic ──────────────────────────────────────
function shouldRetry(error) {
  if (error?.code === 'ERR_CANCELED') return false;
  const method = (error?.config?.method || '').toLowerCase();
  if (method && method !== 'get') return false;

  const status = error?.response?.status;
  if (!status) return true;
  return status === 429 || status >= 500;
}

// ─── Response interceptor: 401 + retry ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    
    // Auto-logout on 401
    if (error.response?.status === 401) {
      clearAuthState.current?.();
      return Promise.reject(error);
    }

    // Retry logic (GET only, max 2 retries)
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    if (shouldRetry(error) && config.__retryCount < 2) {
      config.__retryCount += 1;
      const delayMs = 250 * 2 ** (config.__retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
