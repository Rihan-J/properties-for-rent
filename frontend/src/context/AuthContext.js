'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { setTokenGetter, clearAuthState } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('apnastay_token');
    const storedUser = localStorage.getItem('apnastay_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('apnastay_token');
        localStorage.removeItem('apnastay_user');
      }
    }
    setLoading(false);
  }, []);

  // Register the token getter so Axios can read from state
  useEffect(() => {
    setTokenGetter(() => token);
    return () => setTokenGetter(null);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('apnastay_token', newToken);
    localStorage.setItem('apnastay_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role = 'user', phone) => {
    const res = await api.post('/auth/register', { name, email, password, role, phone });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('apnastay_token', newToken);
    localStorage.setItem('apnastay_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('apnastay_token');
    localStorage.removeItem('apnastay_user');
    setToken(null);
    setUser(null);
  }, []);

  // Wire up the 401 handler to clear auth state
  useEffect(() => {
    clearAuthState.current = logout;
  }, [logout]);

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isOwner, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
