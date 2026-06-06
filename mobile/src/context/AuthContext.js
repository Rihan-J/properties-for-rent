/**
 * AuthContext — adapted from frontend/src/context/AuthContext.js
 *
 * Key changes:
 * - AsyncStorage instead of localStorage
 * - No 'use client' directive (not needed in RN)
 * - Token loaded async on app start → persistent login
 * - 401 interceptor clears state (automatic logout on invalid token)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setToken, clearAuthState, loadToken } from '../config/api';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load persisted auth on app start ──────────────────
  useEffect(() => {
    async function restoreAuth() {
      try {
        const storedToken = await loadToken();
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setTokenState(storedToken);
          setUser(userData);
          setToken(storedToken); // Set in API module for interceptors
        }
      } catch {
        // Corrupted data — clear it
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      } finally {
        setLoading(false);
      }
    }
    restoreAuth();
  }, []);

  // ─── Wire up the 401 handler ───────────────────────────
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    } catch {}
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    clearAuthState.current = logout;
  }, [logout]);

  // ─── Login ────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    setToken(newToken);
    setTokenState(newToken);
    setUser(userData);
    return userData;
  }, []);

  // ─── Register ─────────────────────────────────────────
  const register = useCallback(
    async (name, email, password, role = 'user', phone, accepted_terms = false) => {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone,
        accepted_terms,
      });
      const { token: newToken, user: userData } = res.data.data;

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setToken(newToken);
      setTokenState(newToken);
      setUser(userData);
      return userData;
    },
    []
  );

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isOwner, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
