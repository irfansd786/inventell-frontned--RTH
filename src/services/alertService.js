import { apiGet, apiPost } from './api';
import { alertsSummaryKPIs, alertsList } from '../data/alertsData';

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.alerts)) return raw.alerts;
  return [];
}

function toPageAlert(a = {}) {
  const severityRaw = String(a.severity || 'Medium');
  const severity = severityRaw.charAt(0).toUpperCase() + severityRaw.slice(1).toLowerCase();
  const sev = severity === 'Warning' ? 'Medium' : severity === 'Critical' ? 'Critical' : severity;
  return {
    id: a.id || `ALT-${a.category || 'OP'}`,
    title: a.title || 'Operational Alert',
    severity: sev,
    category: a.category || 'General',
    description: a.description || a.message || '',
    message: a.message || a.description || '',
    read: Boolean(a.is_read ?? a.read ?? false),
    time: a.time || a.detectedTime || 'Just now',
    detectedTime: a.detectedTime || a.time || 'Just now',
    source: a.source || (String(a.category).toLowerCase().includes('queue') ? 'Camera 02 (Checkout Zone)' : 'System Operational Monitor'),
    status: a.status || (a.is_read ? 'Resolved' : 'Active'),
    currentValue: a.currentValue || 'Operational condition active',
    threshold: a.threshold || 'Service threshold exceeded',
    impact: a.impact || 'Service SLA or stock availability impact',
    recommendedResponse: a.recommendedResponse || 'Review alert context and execute standard operating procedure.',
    relatedModule: a.relatedModule || a.link || a.related_module || '/alerts',
    relatedModuleName: a.relatedModuleName || 'Operations',
    sku: a.sku || 'N/A',
  };
}

export const alertService = {
  getSummary: async () => {
    try {
      const raw = await apiGet('/alerts');
      const alerts = normalizeList(raw);
      if (alerts.length === 0) return { ...alertsSummaryKPIs };
      const active = alerts.filter((a) => !a.is_read && a.status !== 'Resolved').length;
      const critical = alerts.filter((a) => String(a.severity).toUpperCase() === 'CRITICAL' && !a.is_read).length;
      const high = alerts.filter((a) => String(a.severity).toUpperCase() === 'HIGH' && !a.is_read).length;
      const resolved = alerts.filter((a) => a.is_read || a.status === 'Resolved').length;
      return {
        active: active || alertsSummaryKPIs.active,
        critical: critical || alertsSummaryKPIs.critical,
        high: high || alertsSummaryKPIs.high,
        resolved: resolved || alertsSummaryKPIs.resolved,
      };
    } catch {
      return { ...alertsSummaryKPIs };
    }
  },
  getAlerts: async () => {
    try {
      const raw = await apiGet('/alerts');
      const backendAlerts = normalizeList(raw);
      if (!backendAlerts || backendAlerts.length === 0) return alertsList;
      // Merge live backend alerts (like queue alerts from CCTV) with seed alerts
      const backendNormalized = backendAlerts.map(toPageAlert);
      const seedIds = new Set(alertsList.map((a) => String(a.id)));
      const combined = [
        ...backendNormalized.filter((a) => !seedIds.has(String(a.id))),
        ...alertsList,
      ];
      return combined;
    } catch {
      return alertsList;
    }
  },
  markAsRead: async (id) => {
    try {
      return await apiPost(`/alerts/${id}/read`);
    } catch {
      return { id, status: 'Resolved' };
    }
  },
  markAllAsRead: async () => {
    return true;
  },
  resolveAlert: async (id) => {
    try {
      await apiPost(`/alerts/${id}/read`);
    } catch {
      // Fallback in-memory
    }
    return { id, status: 'Resolved' };
  },
};
