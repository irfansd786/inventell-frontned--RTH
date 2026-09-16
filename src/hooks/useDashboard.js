import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardAiInsights,
  getDashboardRisks,
  getDashboardSummary,
  getInventoryHealth,
  getOperationsFlow,
  getRevenueSeries,
  getSalesByCategory,
  getSalesIntelligence,
  getSalesSummary,
  getStoreIntelligence,
} from '../services/dashboardService';

// Generic async-resource hook with loading / error / retry states.
function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}

export function useDashboard(range = '7d') {
  return useResource(() => getDashboardSummary(range), [range]);
}

export function useRevenue(range = '7d', metric = 'revenue') {
  return useResource(() => getRevenueSeries(range, metric), [range, metric]);
}

export function useSalesIntelligence(range = '7d') {
  return useResource(() => getSalesIntelligence(range), [range]);
}

export function useRisks() {
  return useResource(getDashboardRisks);
}

export function useInventoryHealth() {
  return useResource(getInventoryHealth);
}

export function useStoreIntelligence() {
  return useResource(getStoreIntelligence);
}

export function useAiInsights() {
  return useResource(getDashboardAiInsights);
}

export function useOperations() {
  return useResource(getOperationsFlow);
}

export function useSalesSummary() {
  return useResource(getSalesSummary);
}

export function useSalesCategories() {
  return useResource(getSalesByCategory);
}
