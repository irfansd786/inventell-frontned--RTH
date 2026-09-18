// Customer Analytics service — CustomerAnalytics.jsx -> FastAPI ONLY.
// Source of truth: GET /api/analytics/customers/combined (BOTH cameras:
// camera_01 + camera_02 tracking merged server-side with per-camera
// namespaced track IDs — no cross-camera identity matching is claimed).
// No fake data, no randomness, no static customer arrays, no camera switching.

import { apiGet } from './api';

export const CUSTOMER_PERIODS = ['today', 'yesterday', '7d', '30d', 'custom'];
export const CUSTOMER_GRANULARITIES = ['hourly', 'daily', 'weekly'];

export const PERIOD_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  custom: 'Custom',
};

function buildQuery({ timestamp, period, granularity, camera, zone, compare, windowStart, windowEnd }) {
  const params = new URLSearchParams();
  if (timestamp > 0) params.set('timestamp', String(timestamp));
  params.set('period', period || 'today');
  params.set('granularity', granularity || 'hourly');
  if (camera && camera !== 'all' && camera !== 'combined') params.set('camera_id', camera);
  if (zone && zone !== 'all') params.set('zone_id', zone);
  if (compare) params.set('compare', 'true');
  if (windowStart != null) params.set('window_start', String(windowStart));
  if (windowEnd != null) params.set('window_end', String(windowEnd));
  return params.toString();
}

/**
 * Fetch store-level customer analytics across cameras and zones.
 * All numbers are computed server-side from real CCTV tracking data
 * (or honest empty states when unavailable).
 */
export async function getCustomerAnalyticsData({
  timestamp = 0,
  period = 'today',
  granularity = 'hourly',
  camera = 'all',
  zone = 'all',
  compare = false,
  windowStart = null,
  windowEnd = null,
} = {}) {
  const q = buildQuery({ timestamp, period, granularity, camera, zone, compare, windowStart, windowEnd });
  return apiGet(`/api/analytics/customers/combined?${q}`);
}

/**
 * Export the currently loaded analytics payload as JSON.
 * Real download of the live response — never a fabricated file.
 */
export function exportCustomerAnalytics(payload, { period = 'today' } = {}) {
  if (!payload) return { success: false, message: 'No analytics data to export.' };
  const doc = {
    report: 'customer-analytics',
    cameras: ['camera_01', 'camera_02'],
    period,
    generated_at: new Date().toISOString(),
    source: payload?.meta?.source || 'cctv',
    data: payload,
  };
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `customer-analytics-store-${period}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return { success: true, message: 'Customer analytics report exported.' };
}
