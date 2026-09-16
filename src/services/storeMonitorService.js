// Store Monitor service — React -> FastAPI. No direct YOLO/OpenCV dependency.
// Polling (REST) is used for testing videos; a future /ws/store-monitor feed
// can replace these pollers without changing components.

import { API_BASE_URL, getAccessToken } from '../config/api';

function headers(extra = {}) {
  const h = { ...extra };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function get(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`Store Monitor API error: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Store Monitor API error: ${res.status}`);
  }
  return res.json();
}

const BASE = '/store-monitor';

export function streamUrl(cameraId) {
  return `${API_BASE_URL}${BASE}/video/${cameraId}`;
}

export async function listVideos() {
  return get(`${BASE}/videos`);
}

export async function uploadVideo(cameraId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE_URL}${BASE}/upload?camera_id=${cameraId}`, {
    method: 'POST',
    headers: headers(),
    body: form,
  });
  if (!res.ok) throw new Error('Video upload failed');
  return res.json();
}

export async function startProcessing(cameraId, force = false) {
  return post(`${BASE}/start`, { camera_id: cameraId, force });
}

export async function stopProcessing(cameraId) {
  return post(`${BASE}/stop`, { camera_id: cameraId });
}

export async function getStatus(cameraId) {
  return get(`${BASE}/status?camera_id=${cameraId}`);
}

export async function getTracks(cameraId, timestamp) {
  return get(`${BASE}/tracks?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getMap(cameraId, timestamp) {
  return get(`${BASE}/map?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getMetrics(cameraId, timestamp) {
  return get(`${BASE}/metrics?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getEvents(cameraId, timestamp, limit = 20) {
  return get(`${BASE}/events?camera_id=${cameraId}&timestamp=${timestamp}&limit=${limit}`);
}

export async function getZones(cameraId, timestamp) {
  return get(`${BASE}/zones?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getCalibration(cameraId) {
  return get(`${BASE}/calibration?camera_id=${cameraId}`);
}

export async function getCameras() {
  return get(`${BASE}/cameras`);
}

export async function getSummary(t1 = 0, t2 = 0) {
  return get(`${BASE}/summary?t1=${t1}&t2=${t2}`);
}

export async function getQueue(cameraId, timestamp) {
  return get(`/analytics/queue?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getSession(cameraId, timestamp) {
  return get(`${BASE}/session?camera_id=${cameraId}&timestamp=${timestamp}`);
}

export async function getGlobalPeople(t1 = 0, t2 = 0) {
  return get(`${BASE}/global-people?t1=${t1}&t2=${t2}`);
}

export async function getGlobalJourneys(t1 = 0, t2 = 0) {
  return get(`${BASE}/global-journeys?t1=${t1}&t2=${t2}`);
}

