// Store Monitor service — React -> FastAPI.
import { apiGet, apiPost, buildFullUrl } from './api';
import { getAccessToken } from '../config/api';

function headers(extra = {}) {
  const h = { ...extra };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const BASE = '/store-monitor';

export function streamUrl(cameraId) {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}videos/${cameraId}.mp4`;
}

export async function listVideos() {
  return apiGet(`${BASE}/videos`, { cache: false });
}

export async function uploadVideo(cameraId, file) {
  const form = new FormData();
  form.append('file', file);
  const uploadUrl = buildFullUrl(`${BASE}/upload?camera_id=${cameraId}`);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: headers(),
    body: form,
  });
  if (!res.ok) throw new Error('Video upload failed');
  return res.json();
}

export async function startProcessing(cameraId, force = false) {
  return apiPost(`${BASE}/start`, { camera_id: cameraId, force });
}

export async function stopProcessing(cameraId) {
  return apiPost(`${BASE}/stop`, { camera_id: cameraId });
}

export async function getStatus(cameraId) {
  return apiGet(`${BASE}/status?camera_id=${cameraId}`, { cache: false });
}

export async function getTracks(cameraId, timestamp) {
  return apiGet(`${BASE}/tracks?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getMap(cameraId, timestamp) {
  return apiGet(`${BASE}/map?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getMetrics(cameraId, timestamp) {
  return apiGet(`${BASE}/metrics?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getEvents(cameraId, timestamp, limit = 20) {
  return apiGet(`${BASE}/events?camera_id=${cameraId}&timestamp=${timestamp}&limit=${limit}`, { cache: false });
}

export async function getZones(cameraId, timestamp) {
  return apiGet(`${BASE}/zones?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getCalibration(cameraId) {
  return apiGet(`${BASE}/calibration?camera_id=${cameraId}`);
}

export async function getCameras() {
  return apiGet(`${BASE}/cameras`, { cache: false });
}

export async function getSummary(t1 = 0, t2 = 0) {
  return apiGet(`${BASE}/summary?t1=${t1}&t2=${t2}`, { cache: false });
}

export async function getQueue(cameraId, timestamp) {
  return apiGet(`/api/analytics/queue?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getSession(cameraId, timestamp) {
  return apiGet(`${BASE}/session?camera_id=${cameraId}&timestamp=${timestamp}`, { cache: false });
}

export async function getGlobalPeople(t1 = 0, t2 = 0) {
  return apiGet(`${BASE}/global-people?t1=${t1}&t2=${t2}`, { cache: false });
}

export async function getGlobalJourneys(t1 = 0, t2 = 0) {
  return apiGet(`${BASE}/global-journeys?t1=${t1}&t2=${t2}`, { cache: false });
}
