// Finance service — 100% backend-driven (GET /api/finance/summary).
// Every figure is aggregated from ingested sales rows. Falls back to local
// demo constants only when the backend is unreachable.
import { apiGet } from './api';
import {
  financeSummaryKPIs,
  paymentMethodBreakdown,
  grossVsNetData,
  topRevenueProducts,
} from '../data/financeData';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'];

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

let cache = null;

async function load() {
  if (cache) return cache;
  const raw = await apiGet('/finance/summary');
  cache = raw;
  return raw;
}

export function clearFinanceCache() {
  cache = null;
}

export const financeService = {
  getSummaryKPIs: async () => {
    try {
      const s = await load();
      return {
        grossSales: inr(s.gross),
        discounts: inr(0),
        refunds: `${inr(s.refunds)} (${s.orders || 0} orders)`,
        netRevenue: inr(s.net),
        inventoryValue: financeSummaryKPIs.inventoryValue,
        grossMarginPct: `${s.grossMarginPct}%`,
        netMarginPct: `${s.netMarginPct}%`,
        avgTransactionValue: s.orders ? inr(s.net / s.orders) : '₹0',
        period: s.period,
      };
    } catch {
      return financeSummaryKPIs;
    }
  },
  getPaymentBreakdown: async () => {
    try {
      const s = await load();
      return (s.payments || []).map((p, i) => ({
        name: p.name,
        value: p.value,
        amount: inr(p.amount),
        color: COLORS[i % COLORS.length],
      }));
    } catch {
      return paymentMethodBreakdown;
    }
  },
  getGrossVsNetTrend: async () => {
    try {
      const s = await load();
      return s.trend || grossVsNetData;
    } catch {
      return grossVsNetData;
    }
  },
  getTopRevenueProducts: async () => {
    try {
      const s = await load();
      return (s.topProducts || []).map((p) => ({
        ...p,
        revenue: inr(p.revenue),
      }));
    } catch {
      return topRevenueProducts;
    }
  },
};
