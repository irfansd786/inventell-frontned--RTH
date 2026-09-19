// Centralized HTTP client for the FastAPI backend with timeout & caching.
// All domain services import { apiGet, apiPost, apiPut, apiDelete } from here.

import { auth } from '../config/firebase';
import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY, setAuthTokens } from '../config/api';

const memoryCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export function buildFullUrl(endpoint) {
  let ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let base = API_BASE_URL.replace(/\/$/, '');

  if (base.endsWith('/api') && ep.startsWith('/api/')) {
    ep = ep.substring(4); // Avoid duplicate /api/api when base already includes /api
  } else if (!base.endsWith('/api') && !ep.startsWith('/api/')) {
    ep = `/api${ep}`; // Ensure /api prefix if base does not end with /api
  }
  return `${base}${ep}`;
}

let cachedFbToken = null;
let cachedFbTokenExpiry = 0;

async function getFirebaseTokenWithTimeout(timeoutMs = 2000) {
  if (!auth?.currentUser) return null;
  const now = Date.now();
  if (cachedFbToken && now < cachedFbTokenExpiry) {
    return cachedFbToken;
  }
  try {
    const tokenPromise = auth.currentUser.getIdToken();
    const timeoutPromise = new Promise((res) => setTimeout(() => res(null), timeoutMs));
    const token = await Promise.race([tokenPromise, timeoutPromise]);
    if (token) {
      cachedFbToken = token;
      cachedFbTokenExpiry = now + 10 * 60 * 1000; // 10 minutes cache
    }
    return token;
  } catch {
    return null;
  }
}

async function buildHeaders(extra = {}, authEnabled = true) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (authEnabled) {
    const freshToken = await getFirebaseTokenWithTimeout(2000);
    if (freshToken) {
      setAuthTokens({ accessToken: freshToken });
      headers.Authorization = `Bearer ${freshToken}`;
      return headers;
    }

    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) headers.Authorization = `Bearer ${storedToken}`;
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

export async function request(
  endpoint,
  { method = 'GET', body, headers, auth = true, timeout = 20000, cache = false } = {}
) {
  const fullUrl = buildFullUrl(endpoint);
  const cacheKey = `${method}:${fullUrl}`;

  // Serve fast from cache if enabled
  if (cache && method === 'GET' && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    const resolvedHeaders = await buildHeaders(headers, auth);
    response = await fetch(fullUrl, {
      method,
      headers: resolvedHeaders,
      body: typeof body === 'string' ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    // On failure/timeout, return cached version if available
    if (method === 'GET' && memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey).data;
    }
    const isTimeout = err.name === 'AbortError';
    const msg = isTimeout
      ? `Request to ${endpoint} timed out after ${timeout}ms.`
      : `Unable to reach the backend at ${API_BASE_URL}.`;
    throw new ApiError(msg, isTimeout ? 408 : 0, null);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401) {
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
    const detail = data?.detail || data?.message || `Request failed (${response.status})`;
    throw new ApiError(typeof detail === 'string' ? detail : 'Request failed.', response.status, data);
  }

  // Cache successful GET responses
  if (method === 'GET' && data !== null) {
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

export const apiGet = (endpoint, opts) => request(endpoint, { ...opts, method: 'GET', cache: opts?.cache ?? true });
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
