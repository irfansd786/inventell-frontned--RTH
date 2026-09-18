// Zone Analytics service layer calling real backend CCTV telemetry across Camera 01 + Camera 02.
import { apiGet } from './api';

export async function getZoneAnalyticsData({
  cameraId = 'combined',
  timestamp = 0.0,
  period = 'today',
  windowStart = null,
  windowEnd = null,
} = {}) {
  const query = new URLSearchParams({
    timestamp: String(timestamp),
    period,
    camera_id: cameraId,
  });
  if (windowStart != null) query.append('window_start', String(windowStart));
  if (windowEnd != null) query.append('window_end', String(windowEnd));

  return apiGet(`/api/analytics/zones/combined?${query.toString()}`);
}

export function exportZonesReport(data, { period = 'Today' } = {}) {
  if (!data) return;
  const kpis = data.overviewKpis || {};
  const table = data.table || [];
  const transitions = data.transitions || [];
  const customerFlow = data.customerFlow || [];
  const alerts = data.operationalAlerts || [];
  const meta = data.meta || {};

  const lines = [
    '=================================================================',
    'INVINTELL RETAIL INTELLIGENCE — STORE ZONE INTELLIGENCE REPORT',
    `Generated: ${new Date().toISOString()}`,
    `Filter Window: ${period}`,
    `Source: ${data.dataProvenance || 'Combined CCTV Session Telemetry (Camera 01 + Camera 02)'}`,
    `Cameras Analyzing: Camera 01 (${meta?.cameras?.camera_01?.connected ? 'ACTIVE' : 'OFFLINE'}) · Camera 02 (${meta?.cameras?.camera_02?.connected ? 'ACTIVE' : 'OFFLINE'})`,
    '=================================================================',
    '',
    '--- 1. ZONE OVERVIEW METRICS ---',
    `Active Zones          : ${kpis.activeZones?.value || '0 / 7 Zones'}`,
    `Occupied Zones        : ${kpis.occupiedZones?.value || '0 Occupied'}`,
    `Highest Traffic Zone  : ${kpis.highestTrafficZone?.value || '—'} (${kpis.highestTrafficZone?.subtitle || ''})`,
    `Highest Dwell Zone    : ${kpis.highestDwellZone?.value || '—'} (${kpis.highestDwellZone?.subtitle || ''})`,
    `Total Transitions     : ${kpis.totalTransitions?.value || 0}`,
    '',
    '--- 2. ZONE PERFORMANCE TABLE ---',
    'ZONE             PEOPLE  VISITS  AVG DWELL  SHARE    OCCUPANCY  STATUS',
    '-----------------------------------------------------------------',
    ...table.map(
      (z) =>
        `${z.name.padEnd(16)} ` +
        `${String(z.people || 0).padStart(6)}  ` +
        `${String(z.visits || 0).padStart(6)}  ` +
        `${(z.avg_dwell || '0m 00s').padStart(9)}  ` +
        `${(z.traffic_share || '0.0%').padStart(7)}  ` +
        `${(z.occupancy || '0%').padStart(9)}  ` +
        `${z.status}`
    ),
    '',
    '--- 3. ZONE TRANSITIONS (FROM → TO) ---',
    ...transitions.map(
      (t) =>
        `${t.from_name} → ${t.to_name}: ${t.customers} transitions (${t.share}%)`
    ),
    '',
    '--- 4. CUSTOMER FLOW SEQUENCES ---',
    ...customerFlow.map((f) => `* ${f.path} [${f.count} visitors, ${f.share}%]`),
    '',
    '--- 5. OPERATIONAL ALERTS ---',
    ...(alerts.length > 0
      ? alerts.map((a) => `[!${a.type.toUpperCase()}] ${a.title} (${a.zone}): ${a.message}`)
      : ['No active operational threshold violations.']),
    '',
    '--- 6. TELEMETRY AUDIT ---',
    `Total Observations    : ${meta.total_observations || 0} observations`,
    `Cross-Camera Matching : ${meta.cross_camera_matching ? 'Enabled' : 'None (Camera Observations Only)'}`,
    `Status Notice         : ${meta.note || 'Real tracking data from CCTV pipeline.'}`,
    '=================================================================',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `store_zones_${period.toLowerCase()}_${Date.now()}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

