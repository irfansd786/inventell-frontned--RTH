// Shared helpers for the dual-camera monitor. Persons-only filtering and
// clock formatting. No invented values — fallbacks render as 'Unavailable'.

export function fmtClock(sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return '—';
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtDwell(sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return '—';
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}

export function isPersonTrack(p) {
  if (!p) return false;
  if (p.class_id !== undefined && p.class_id !== 0) return false;
  if (p.class_name !== undefined && p.class_name !== null
      && String(p.class_name).toLowerCase() !== 'person') return false;
  return true;
}

export function onlyPeople(list) {
  return (list || []).filter(isPersonTrack);
}

export function confLabel(p) {
  if (p.confidence === undefined || p.confidence === null || Number.isNaN(Number(p.confidence))) return '—';
  return `${Math.round(Number(p.confidence) * 100)}%`;
}

/** Factual movement state derived only from real track fields. */
export function movementState(p) {
  const zone = p.zone_name || p.zone || '';
  if (String(p.zone || '').toLowerCase() === 'checkout') return 'In Queue';
  if (p.dwell !== undefined && p.dwell !== null && Number(p.dwell) <= 3) return 'Entering';
  return zone ? `In ${zone}` : 'Unknown';
}

export const CAMERA_META = {
  camera_01: { label: 'Camera 01', role: 'Main Entrance & Checkout' },
  camera_02: { label: 'Camera 02', role: 'Store Interior · Secondary View' },
};
