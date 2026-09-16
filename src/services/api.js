// Centralized HTTP client for the FastAPI backend.
// All domain services import { apiGet, apiPost, apiPut, apiDelete } from here.
//
// Auth: JWT access token from localStorage (see config/api.js) is attached
// automatically. On 401 the session is NOT silently mocked — callers surface
// the error and AuthProvider redirects to /login.

import { auth } from '../config/firebase';
import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY, setAuthTokens } from '../config/api';

async function buildHeaders(extra = {}, authEnabled = true) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (authEnabled) {
    try {
      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          setAuthTokens({ accessToken: token });
          headers.Authorization = `Bearer ${token}`;
          return headers;
        }
      }
    } catch {
      /* fallback to stored token */
    }

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return headers;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, { method = 'GET', body, headers, auth = true } = {}) {
  let response;
  try {
    const resolvedHeaders = await buildHeaders(headers, auth);
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: resolvedHeaders,
      body: typeof body === 'string' ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`Unable to reach the backend at ${API_BASE_URL}.`, 0, null);
  }

  if (response.status === 401) {
    // Session expired/invalid — clear local auth so ProtectedRoute redirects.
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      /* ignore */
    }
    throw new ApiError('Session expired. Please sign in again.', 401, null);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      data?.detail || data?.message || `Request failed (${response.status})`;
    throw new ApiError(typeof detail === 'string' ? detail : 'Request failed.', response.status, data);
  }
  return data;
}
export const apiGet = (endpoint, opts) => request(endpoint, { ...opts, method: 'GET' });
export const apiPost = (endpoint, body, opts) => request(endpoint, { ...opts, method: 'POST', body });
export const apiPut = (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PUT', body });
export const apiPatch = (endpoint, body, opts) => request(endpoint, { ...opts, method: 'PATCH', body });
export const apiDelete = (endpoint, opts) => request(endpoint, { ...opts, method: 'DELETE' });

// Backwards-compatible wrapper used by legacy callers.
export async function fetchApi(endpoint, options = {}) {
  const method = options.method || 'GET';
  let body;
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = options.body;
    }
  }
  const { method: _m, body: _b, headers, ...rest } = options;
  return request(endpoint, { method, body, headers, ...rest });
}
