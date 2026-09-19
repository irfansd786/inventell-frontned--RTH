import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiGet, apiPost } from '../services/api';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuthTokens,
  setAuthTokens,
} from '../config/api';
import { ALL_PERMISSION_IDS } from '../config/permissions';

export const AuthContext = createContext(null);

const CACHED_PROFILE_KEY = 'invintell_user_profile';

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(CACHED_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => readStoredProfile());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Fetch or build the authorization profile for a Firebase user
  const fetchProfile = useCallback(async (fbUser) => {
    if (!fbUser) return null;
    try {
      // Backend profile endpoint: GET /api/staff/me with resilient timeout
      const data = await apiGet('/staff/me', { timeout: 15000, cache: true });
      if (data && data.uid) {
        try {
          localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(data));
        } catch {
          /* ignore */
        }
        return data;
      }
    } catch {
      // Backend not yet reached or offline dev mode
    }

    // Fallback: check cached profile if matching UID or email
    const cached = readStoredProfile();
    if (cached && (cached.uid === fbUser.uid || cached.email?.toLowerCase() === fbUser.email?.toLowerCase())) {
      return cached;
    }

    // Default administrator fallback if registered as admin email
    const isAdminEmail = fbUser.email?.toLowerCase() === 'admin@invintell.com';
    const fallbackProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || (isAdminEmail ? 'System Administrator' : fbUser.email?.split('@')[0] || 'Employee'),
      email: fbUser.email,
      role: isAdminEmail ? 'admin' : 'employee',
      status: 'active',
      assigned_modules: isAdminEmail ? ALL_PERMISSION_IDS : ['inventory', 'orders', 'picking'],
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(fallbackProfile));
    } catch {
      /* ignore */
    }
    return fallbackProfile;
  }, []);

  // Listen to Firebase Authentication state changes (source of truth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);

        // Immediate cache resolution so UI unlocks in 0ms
        const cached = readStoredProfile();
        if (cached && (cached.uid === fbUser.uid || cached.email?.toLowerCase() === fbUser.email?.toLowerCase())) {
          setProfile(cached);
          setLoading(false);
        } else {
          // Fallback profile preview while fetching
          const isAdminEmail = fbUser.email?.toLowerCase() === 'admin@invintell.com';
          const quickProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || (isAdminEmail ? 'System Administrator' : fbUser.email?.split('@')[0] || 'Employee'),
            email: fbUser.email,
            role: isAdminEmail ? 'admin' : 'employee',
            status: 'active',
            assigned_modules: isAdminEmail ? ALL_PERMISSION_IDS : ['inventory', 'orders', 'picking'],
          };
          setProfile(quickProfile);
          setLoading(false);
        }

        // Background profile sync
        try {
          const prof = await fetchProfile(fbUser);
          if (prof) {
            if (prof.status === 'inactive') {
              await signOut(auth);
              clearAuthTokens();
              setUser(null);
              setProfile(null);
              try {
                localStorage.removeItem(CACHED_PROFILE_KEY);
              } catch {
                /* ignore */
              }
              setAuthError('Your account is currently inactive. Please contact your administrator.');
              setLoading(false);
              return;
            }
            setProfile(prof);
          }
        } catch {
          /* background refresh failed, keep cached/quick profile */
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        clearAuthTokens();
        try {
          localStorage.removeItem(CACHED_PROFILE_KEY);
        } catch {
          /* ignore */
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  // Login handler using Firebase Authentication
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;
      const token = await fbUser.getIdToken();
      setAuthTokens({ accessToken: token });
      setUser(fbUser);

      const prof = await fetchProfile(fbUser);

      // Verify active status
      if (prof && prof.status === 'inactive') {
        await signOut(auth);
        clearAuthTokens();
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem(CACHED_PROFILE_KEY);
        } catch {
          /* ignore */
        }
        const msg = 'Your account is currently inactive. Please contact your administrator.';
        setAuthError(msg);
        setLoading(false);
        throw new Error(msg);
      }

      setProfile(prof);
      setLoading(false);
      return { user: fbUser, profile: prof };
    } catch (err) {
      setLoading(false);
      let message = err.message || 'Login failed. Please check your credentials.';

      // Map Firebase error codes to professional messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact your administrator.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again in a few moments.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network connectivity error. Please verify your internet connection.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      setAuthError(message);
      throw new Error(message);
    }
  }, [fetchProfile]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    } finally {
      clearAuthTokens();
      try {
        localStorage.removeItem(CACHED_PROFILE_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
      setProfile(null);
      setAuthError('');
    }
  }, []);

  // Re-fetch employee profile
  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      const prof = await fetchProfile(auth.currentUser);
      setProfile(prof);
      return prof;
    }
    return null;
  }, [fetchProfile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    const r = (profile.role || '').toLowerCase();
    return r === 'admin';
  }, [profile]);

  const permissions = useMemo(() => {
    if (!profile) return [];
    if (isAdmin) return ALL_PERMISSION_IDS;
    return Array.isArray(profile.assigned_modules) ? profile.assigned_modules : [];
  }, [profile, isAdmin]);

  const hasPermission = useCallback((moduleId) => {
    if (!profile || profile.status === 'inactive') return false;
    if (isAdmin) return true;
    if (moduleId === 'store_monitor' && permissions.includes('live_store_monitor')) return true;
    if (moduleId === 'live_store_monitor' && permissions.includes('store_monitor')) return true;
    return permissions.includes(moduleId);
  }, [profile, isAdmin, permissions]);

  const hasAnyPermission = useCallback((moduleIds = []) => {
    if (!profile || profile.status === 'inactive') return false;
    if (isAdmin) return true;
    return moduleIds.some((id) => permissions.includes(id));
  }, [profile, isAdmin, permissions]);

  const hasAllPermissions = useCallback((moduleIds = []) => {
    if (!profile || profile.status === 'inactive') return false;
    if (isAdmin) return true;
    return moduleIds.every((id) => permissions.includes(id));
  }, [profile, isAdmin, permissions]);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user && profile?.status !== 'inactive',
    isAdmin,
    permissions,
    authError,
    login,
    logout,
    refreshProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
