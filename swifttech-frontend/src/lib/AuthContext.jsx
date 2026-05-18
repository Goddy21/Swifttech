/**
 * AuthContext.js
 * Replaces the old platform-specific auth with real JWT-based auth
 * against the Express backend. All existing useAuth() calls keep working.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { SwiftTech } from '@/api/SwiftTechClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // appPublicSettings kept for API compat (unused with our own backend)
  const appPublicSettings = { id: 'swifttech', public_settings: {} };

  const checkUserAuth = useCallback(async () => {
    const token = localStorage.getItem('swifttech_token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    try {
      setIsLoadingAuth(true);
      const currentUser = await SwiftTech.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (err) {
      // Token expired or invalid
      localStorage.removeItem('swifttech_token');
      setUser(null);
      setIsAuthenticated(false);
      if (err.status === 401 || err.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Session expired. Please log in again.' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = async ({ email, password }) => {
    setIsLoadingAuth(true);
    try {
      const data = await SwiftTech.auth.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      setAuthError(null);
      return data;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async ({ email, password, name }) => {
    setIsLoadingAuth(true);
    try {
      const data = await SwiftTech.auth.register({ email, password, name });
      setUser(data.user);
      setIsAuthenticated(true);
      setAuthError(null);
      return data;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = false) => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(false);
    SwiftTech.auth.logout(shouldRedirect ? window.location.origin : undefined);
  };

  const navigateToLogin = () => {
    SwiftTech.auth.redirectToLogin(window.location.href);
  };

  // Kept for API compat with the old platform client
  const checkAppState = checkUserAuth;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        login,
        register,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
