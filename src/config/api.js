// Central API configuration — single source of truth for the backend base URL.
// All services import from here.

function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api')) clean = `${clean}/api`;
    return clean;
  }

  // Auto-detect local development server when running on localhost
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'https://inventell-backend-rth.onrender.com/api';
  }

  return 'https://inventell-backend-rth.onrender.com/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const AUTH_TOKEN_KEY = 'invintell_access_token';
export const AUTH_REFRESH_KEY = 'invintell_refresh_token';
export const AUTH_USER_KEY = 'invintell_session';
export const THEME_KEY = 'invintell_theme';

export function getAccessToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens({ accessToken, refreshToken }) {
  try {
    if (accessToken) localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
  } catch {
    /* storage unavailable */
  }
}

export function clearAuthTokens() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    /* storage unavailable */
  }
}
