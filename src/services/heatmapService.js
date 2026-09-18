// Heatmap service layer calling real backend CCTV footpoint analytics across Camera 01 + Camera 02.
import { apiGet } from './api';

export async function getHeatmapData({
  cameraId = 'combined',
  timestamp = 0.0,
  metric = 'traffic',
  period = 'today',
  windowStart = null,
  windowEnd = null,
} = {}) {
  const query = new URLSearchParams({
    timestamp: String(timestamp),
    metric,
    period,
    camera_id: cameraId,
  });
  if (windowStart != null) query.append('window_start', String(windowStart));
  if (windowEnd != null) query.append('window_end', String(windowEnd));

  return apiGet(`/api/analytics/heatmap/combined?${query.toString()}`);
}

export function exportHeatmapReport(data, { period = 'Today', metric = 'Traffic Density' } = {}) {
  if (!data) return;
  const kpis = data.kpis || {};
  const topZones = data.topZones || [];
  const insights = data.insights || [];
  const meta = data.meta || {};

  const lines = [
    '=================================================================',
    'INVINTELL RETAIL INTELLIGENCE — STORE SPATIAL HEATMAP REPORT',
    `Generated: ${new Date().toISOString()}`,
    `Filter Window: ${period} | Mode: ${data.metric || metric}`,
    `Source: ${data.dataProvenance || 'Combined CCTV Session Telemetry (Camera 01 + Camera 02)'}`,
    `Cameras Analyzing: Camera 01 (${meta?.cameras?.camera_01?.connected ? 'ACTIVE' : 'OFFLINE'}) · Camera 02 (${meta?.cameras?.camera_02?.connected ? 'ACTIVE' : 'OFFLINE'})`,
    '=================================================================',
    '',
    '--- 1. SPATIAL FLOOR KPIS ---',
    `Average Floor Density : ${kpis.avgFloorDensity?.value || '0 pts/frame'} (${kpis.avgFloorDensity?.subtitle || ''})`,
    `Peak Floor Density    : ${kpis.peakFloorDensity?.value || '0%'} (${kpis.peakFloorDensity?.subtitle || ''})`,
    `Highest Traffic Zone  : ${kpis.highestTrafficZone?.value || '—'} (${kpis.highestTrafficZone?.subtitle || ''})`,
    `Tracked Points        : ${kpis.trackedPoints?.value || 0}`,
    `Active Sessions       : ${kpis.activeSessions?.value || 0}`,
    '',
    '--- 2. TOP TRAFFIC AREAS (HOTSPOT RANKING) ---',
    ...topZones.map(
      (tz) =>
        `#${tz.rank} ${tz.name.padEnd(16)} | Points: ${String(tz.points || 0).padStart(6)} | Share: ${(tz.share || tz.trafficPercent || '0%').padStart(6)} | Status: ${tz.status}`
    ),
    '',
    '--- 3. SPATIAL & MOVEMENT INSIGHTS ---',
    ...insights.map((ins) => `* ${typeof ins === 'string' ? ins : ins.description || ins.title}`),
    '',
    '--- 4. TELEMETRY AUDIT ---',
    `Total Observations    : ${meta.total_observations || 0} coordinate pairs`,
    `Cross-Camera Matching : ${meta.cross_camera_matching ? 'Enabled' : 'None (Camera Observations Only)'}`,
    `Status Notice         : ${meta.note || 'Real tracking data from CCTV pipeline.'}`,
    '=================================================================',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `store_heatmap_${period.toLowerCase()}_${Date.now()}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


