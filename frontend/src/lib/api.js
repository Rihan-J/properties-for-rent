import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let _getToken = null;

export function setTokenGetter(getter) {
  _getToken = getter;
}

export const clearAuthState = { current: null };

api.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function shouldRetry(error) {
  if (error?.code === 'ERR_CANCELED') return false;
  const method = (error?.config?.method || '').toLowerCase();
  if (method && method !== 'get') return false;

  const status = error?.response?.status;
  if (!status) return true;
  return status === 429 || status >= 500;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuthState.current?.();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    if (shouldRetry(error) && config.__retryCount < 2) {
      config.__retryCount += 1;
      const delayMs = 250 * (2 ** (config.__retryCount - 1));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
