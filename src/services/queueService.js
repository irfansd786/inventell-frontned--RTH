// Queue analytics service layer calling real backend CCTV checkout telemetry.
import { apiGet, apiPost } from './api';

export async function getQueueAnalyticsData(cameraId = 'camera_01', timestamp = 0.0, threshold = null) {
  try {
    const thresholdQuery = threshold ? `&threshold=${threshold}` : '';
    const data = await apiGet(`/api/analytics/queue?camera_id=${cameraId}&timestamp=${timestamp}${thresholdQuery}`);
    const isConnected = data?.connected !== false;

    return {
      connected: isConnected,
      statusLabel: data?.status_label || (isConnected ? 'VIDEO ANALYSIS' : 'CCTV queue analysis unavailable'),
      dataProvenance: data?.data_provenance || 'CCTV Video Analysis (COCO Person Detection + ByteTrack)',
      cameraId: data?.camera_id || cameraId,
      cameraLabel: data?.camera_label || 'Camera 01 — POS Checkout FOV',
      currentQueue: data?.current_queue ?? 0,
      peopleWaiting: data?.people_waiting ?? data?.current_queue ?? 0,
      queueThreshold: data?.queue_threshold ?? 6,
      thresholds: data?.thresholds || {
        normal_max: 3,
        moderate_max: 6,
        high_max: 10,
        alert_threshold: 6,
        critical_threshold: 11,
      },
      queueStatus: data?.queue_status || 'NORMAL',
      queueRisk: data?.queue_risk || data?.queue_status || 'LOW',
      alertStatus: data?.alert_status || 'NORMAL',
      isAlert: data?.is_alert || false,
      queueGrowth: data?.queue_growth || 'STABLE',
      queueGrowthDisplay: data?.queue_growth_display || 'Stable (0/min)',
      peakQueue: data?.peak_queue ?? 0,
      peakTime: data?.peak_time || '00:00',
      averageWaitSeconds: data?.average_wait_seconds ?? 0.0,
      averageWaitTime: data?.average_wait_time || '00:00',
      activeCheckoutLanes: data?.active_checkout_lanes ?? 0,
      totalCheckoutLanes: data?.total_checkout_lanes ?? 4,
      activeAlert: data?.active_alert || null,
      aiFacts: data?.ai_facts || null,
      recommendation: data?.recommendation || '',
      recommendationReason: data?.recommendation_reason || '',
      queueLengthTrend: data?.queue_length_trend || [],
      waitTimeTrend: data?.wait_time_trend || [],
      checkoutLanes: data?.checkout_lanes || [],
      currentTracks: data?.current_tracks || [],
      people: data?.people || [],
      queueMap: data?.queue_map || null,
      camerasSummary: data?.cameras_summary || {},
      aiInsight: data?.ai_insight || {
        title: isConnected ? 'Checkout Telemetry Active' : 'CCTV queue analysis unavailable',
        description: isConnected
          ? 'Real-time CCTV checkout analytics active.'
          : 'Waiting for analysis — CCTV queue analysis unavailable.',
        severity: data?.queue_risk || 'NORMAL',
        timestamp: isConnected ? 'Active' : 'Awaiting data',
        recommendationText: isConnected ? 'Monitor queue flow.' : 'Connect camera feed.',
        dataSource: 'CCTV ANALYSIS',
      },
      recommendations: data?.recommendations || [],
      recentAlerts: data?.recent_alerts || [],
    };
  } catch (err) {
    console.warn('Queue telemetry API offline, showing honest unavailable state:', err);
    return {
      connected: false,
      statusLabel: 'CCTV queue analysis unavailable',
      dataProvenance: 'Awaiting CCTV Video Stream',
      cameraId,
      cameraLabel: 'Camera 01 — POS Checkout FOV',
      currentQueue: 0,
      peopleWaiting: 0,
      queueThreshold: 6,
      thresholds: {
        normal_max: 3,
        moderate_max: 6,
        high_max: 10,
        alert_threshold: 6,
        critical_threshold: 11,
      },
      queueStatus: 'NORMAL',
      queueRisk: 'LOW',
      alertStatus: 'NORMAL',
      isAlert: false,
      queueGrowth: 'STABLE',
      queueGrowthDisplay: 'Stable (0/min)',
      peakQueue: 0,
      peakTime: '00:00',
      averageWaitSeconds: 0.0,
      averageWaitTime: '00:00',
      activeCheckoutLanes: 0,
      totalCheckoutLanes: 4,
      activeAlert: null,
      aiFacts: null,
      recommendation: 'No action required',
      recommendationReason: 'CCTV queue analysis unavailable.',
      queueLengthTrend: [],
      waitTimeTrend: [],
      checkoutLanes: [],
      currentTracks: [],
      people: [],
      queueMap: null,
      camerasSummary: {},
      aiInsight: {
        title: 'CCTV queue analysis unavailable',
        description: 'Waiting for analysis — unable to reach computer vision queue analytics backend.',
        severity: 'LOW',
        timestamp: 'Unavailable',
        recommendationText: 'Start FastAPI backend server on port 8000.',
        dataSource: 'SYSTEM ALERT',
      },
      recommendations: [],
      recentAlerts: [],
    };
  }
}

export async function getQueueIntelligenceData(cameraId = 'camera_01', timestamp = 0.0) {
  return apiGet(`/api/analytics/queue-intelligence?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getQueueSettings() {
  return apiGet('/api/analytics/queue/settings');
}

export async function saveQueueSettings(settings) {
  return apiPost('/api/analytics/queue/settings', settings);
}

export async function getQueueAlertsHistory({ camera = '', status = '', severity = '', limit = 30 } = {}) {
  const params = new URLSearchParams();
  if (camera && camera !== 'ALL') params.append('camera_id', camera);
  if (status && status !== 'ALL') params.append('status', status);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  params.append('limit', limit);
  return apiGet(`/api/analytics/queue/alerts?${params.toString()}`);
}

export async function recordQueueAlertAction(alertId, action, notes = '') {
  return apiPost(`/api/analytics/queue/alerts/${alertId || 0}/action`, { action, notes });
}
