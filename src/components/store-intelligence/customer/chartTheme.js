// Theme-aware Recharts styling for Customer Analytics.
// Reads the existing ThemeContext — no hardcoded assumptions.

import { useTheme } from '../../../context/ThemeContext';

export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    isDark,
    grid: isDark ? '#1e293b' : '#eef2f7',
    tick: isDark ? '#94a3b8' : '#64748b',
    tooltip: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: '6px',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: '11px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.45)' : '0 4px 12px rgba(15,23,42,0.08)',
    },
  };
}

export const ZONE_COLORS = {
  entry: '#10B981',
  exit: '#6366F1',
  beverages: '#3B82F6',
  snacks: '#8B5CF6',
  grocery: '#F59E0B',
  personal: '#EC4899',
  checkout: '#14B8A6',
  aisle: '#64748B',
};

export function zoneColor(id) {
  return ZONE_COLORS[id] || '#64748B';
}
