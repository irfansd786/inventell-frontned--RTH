import { apiGet } from './api';
import { aiInsightsSummary, aiInsightsList } from '../data/aiInsightsData';

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.insights)) return raw.insights;
  return null;
}

function mapItem(c) {
  return {
    ...c,
    recommendedAction: c.recommendedAction || c.recommended_action || c.action || 'Execute recommended workflow',
    relatedPath: c.relatedPath || c.action_path || '/inventory',
    relatedModuleName: c.relatedModuleName || c.related_module_name || 'System Telemetry',
    detectedTime: c.detectedTime || c.detected_time || 'Just now',
    category: c.category || (c.type?.includes('Inventory') ? 'Inventory' : c.type?.includes('Sales') ? 'Sales' : 'General'),
    priority: c.priority || (c.title?.toLowerCase().includes('critical') ? 'Critical' : 'High'),
    status: c.status || 'Action Required',
    metrics: c.metrics || [],
  };
}

export const aiInsightService = {
  getSummary: async () => {
    try {
      const raw = await apiGet('/dashboard/ai-insights');
      const list = normalizeList(raw) || [];
      if (list.length === 0) return { ...aiInsightsSummary, totalInsights: aiInsightsList.length, highConfidence: aiInsightsList.filter((i) => (i.confidence || 0) >= 90).length, actionable: aiInsightsList.length, modelAccuracy: '91.2%' };
      return {
        totalInsights: list.length,
        todaysCount: list.length,
        highConfidence: list.filter((i) => (i.confidence || 0) >= 90).length,
        highPriorityCount: list.filter((i) => (i.priority || '').toLowerCase() === 'high' || (i.priority || '').toLowerCase() === 'critical').length,
        actionable: list.length,
        implementedToday: 0,
        modelAccuracy: '91.2%',
        avgConfidence: 91,
      };
    } catch {
      return { ...aiInsightsSummary };
    }
  },
  getInsights: async () => {
    try {
      const raw = await apiGet('/dashboard/ai-insights');
      const list = normalizeList(raw);
      if (list && list.length > 0) {
        return list.map(mapItem);
      }
      return aiInsightsList.map(mapItem);
    } catch {
      return aiInsightsList.map(mapItem);
    }
  },
  getInsightById: async (id) => {
    try {
      const raw = await apiGet('/dashboard/ai-insights');
      const list = normalizeList(raw) || aiInsightsList;
      const found = list.find((i) => String(i.id) === String(id));
      return found ? mapItem(found) : null;
    } catch {
      const found = aiInsightsList.find((i) => String(i.id) === String(id));
      return found ? mapItem(found) : null;
    }
  },
};
