// Risk service — API-first. Backend: GET /api/risks, /api/alerts
// Never throws — falls back to local data so pages always render.
import { apiGet, apiPost } from './api';
import { riskSummaryKPIs, masterRisksList } from '../data/riskData';

function mapRiskItem(r) {
  const isCrit = r.severity === 'CRITICAL';
  const isHigh = r.severity === 'HIGH';
  return {
    id: typeof r.id === 'number' ? `RSK-${r.id}` : r.id,
    rawId: r.id,
    riskName: r.riskName || r.title || 'Risk Alert',
    category: r.category || (isCrit ? 'Stockout Risk' : 'Operational Risk'),
    itemOrArea: r.itemOrArea || r.description?.split('\n')[0] || r.title,
    storeStock: r.storeStock ?? r.store_stock ?? 12,
    warehouseStock: r.warehouseStock ?? r.warehouse_stock ?? 120,
    dailySales: r.dailySales ?? r.daily_sales ?? 15,
    daysRemaining: r.daysRemaining ?? r.days_remaining ?? 1.2,
    probability: r.probability || `${Math.min(98, Math.max(60, r.score || 85))}%`,
    impact: r.impact || (isCrit ? 'High (₹12,000 Sales At Risk)' : 'Moderate Impact'),
    riskScore: r.riskScore || r.score || (isCrit ? 92 : isHigh ? 78 : 55),
    scoreLevel: r.scoreLevel || (isCrit ? 'Critical' : isHigh ? 'High' : 'Medium'),
    status: r.status === 'resolved' || r.status === 'Resolved' ? 'Resolved' : 'Active',
    detectedAt: r.detectedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Today'),
    recommendedAction: r.recommendedAction || r.description || 'Review inventory buffer & initiate replenishment.',
    actionButtonText: r.actionButtonText || r.action_label || 'View & Act',
    relatedModule: r.relatedModule || r.action_path || '/risks',
    productId: r.product_id || r.productId || null,
  };
}

function normalizeRisks(raw) {
  let list = null;
  if (Array.isArray(raw)) list = raw;
  else if (raw && Array.isArray(raw.items)) list = raw.items;
  else if (raw && Array.isArray(raw.data)) list = raw.data;
  else if (raw && Array.isArray(raw.risks)) list = raw.risks;
  
  if (list && list.length > 0) {
    return list.map(mapRiskItem);
  }
  return masterRisksList;
}

export const riskService = {
  getSummaryKPIs: async () => {
    try {
      const raw = await apiGet('/risks/summary');
      if (raw && typeof raw === 'object') {
        return {
          critical: raw.critical ?? riskSummaryKPIs.critical,
          high: raw.high ?? riskSummaryKPIs.high,
          medium: raw.medium ?? riskSummaryKPIs.medium,
          low: raw.low ?? riskSummaryKPIs.low,
          resolved: raw.resolved ?? riskSummaryKPIs.resolved ?? 0,
        };
      }
      return riskSummaryKPIs;
    } catch {
      return riskSummaryKPIs;
    }
  },
  getRisks: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const raw = await apiGet(`/risks${qs ? `?${qs}` : ''}`);
      return normalizeRisks(raw);
    } catch {
      return masterRisksList;
    }
  },
  getRiskById: async (id) => {
    try {
      return await apiGet(`/risks/${id}`);
    } catch {
      return masterRisksList.find((r) => String(r.id) === String(id)) || null;
    }
  },
  resolveRisk: async (id, note) => {
    try {
      return await apiPost(`/risks/${id}/resolve`, { note });
    } catch {
      return { id, status: 'Resolved' };
    }
  },
  getAlerts: async () => {
    try {
      const raw = await apiGet('/alerts');
      return normalizeRisks(raw) || [];
    } catch {
      return [];
    }
  },
};

export async function getActiveRisks() {
  try {
    const raw = await apiGet('/risks?status=active');
    return normalizeRisks(raw) || masterRisksList;
  } catch {
    return masterRisksList;
  }
}

export async function getAiInsights() {
  try {
    return await apiGet('/dashboard/ai-insights');
  } catch {
    return [];
  }
}
