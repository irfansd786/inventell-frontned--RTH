// Central API configuration — single source of truth for the backend base URL.
// All services must import from here. Do NOT scatter backend URLs across the app.
//
// Configure via frontend/.env:
//   VITE_API_URL=http://localhost:8000/api

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

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
