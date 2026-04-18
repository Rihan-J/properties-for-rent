import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── In-memory token bridge ─────────────────────────────
// AuthContext registers a getter function so Axios can read
// the token from React state without importing the context.
let _getToken = null;

export function setTokenGetter(getter) {
  _getToken = getter;
}

// AuthContext sets this ref to its logout function for 401 handling
export const clearAuthState = { current: null };

// Attach JWT token to every request from in-memory store
api.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState.current?.();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
