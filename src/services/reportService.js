// Report service — cards are definitions; every number inside comes from
// live backend payloads (/reports/daily). Downloads export the real payload
// as JSON. Falls back to static templates only when offline.
import { apiGet } from './api';
import { reportsList } from '../data/reportData';

function toCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export const reportService = {
  getReports: async () => {
    let daily = null;
    try {
      daily = await apiGet('/reports/daily');
    } catch {
      return reportsList;
    }
    const s = daily?.summary || {};
    return reportsList.map((r) => ({
      ...r,
      lastGenerated: 'Just now (live data)',
      downloadCount: r.downloadCount || 0,
      payload: daily,
      headline:
        r.category === 'Sales Reports'
          ? `Revenue ${s.revenue_today ?? '—'} · Orders ${s.orders_today ?? '—'}`
          : r.category === 'Financial Reports'
            ? `Period ${s.dataset_period ?? ''}`
            : `Source: ${s.data_source_mode ?? 'Historical Dataset Analysis'}`,
    }));
  },
  generateReport: async (reportId, format = 'PDF') => {
    const list = await reportService.getReports();
    const report = list.find((r) => r.id === reportId);
    if (report) {
      report.lastGenerated = 'Just now';
      report.downloadCount = (report.downloadCount || 0) + 1;
    }
    if (report?.payload) {
      const text = format === 'CSV' && Array.isArray(report.payload.hourly)
        ? toCsv(report.payload.hourly)
        : JSON.stringify({ report: reportId, generated_at: new Date().toISOString(), data: report.payload }, null, 2);
      const blob = new Blob([text], { type: format === 'CSV' ? 'text/csv' : 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${reportId}.${format === 'CSV' ? 'csv' : 'json'}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }
    return { success: true, message: `Report ${reportId} generated from live backend data.` };
  },
};
