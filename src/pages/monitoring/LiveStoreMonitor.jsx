// LIVE STORE MONITOR — dual-camera computer vision console.
//
// Pipeline (backend is the source of truth, React visualizes real telemetry):
//   Camera 01 video ─┐
//                    ├→ YOLO (PERSON class 0 only) → person filter → ByteTrack
//   Camera 02 video ─┘   → stable anonymous IDs → foot point → homography
//                       → zone mapping → per-camera analytics → store summary.
//
// Both cameras are analyzed SIMULTANEOUSLY. No camera switching exists.
// Store-level numbers are COMBINED CAMERA OBSERVATIONS (same person may
// appear in both feeds — no cross-camera ReID is implemented or claimed).
// STRICT: no random people, no fake analytics, no fake statuses.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Store3DView from '../../components/monitoring/Store3DView';
import Loading from '../../components/common/Loading';
import {
  getEvents,
  getMap,
  getQueue,
  getStatus,
  getSummary,
  getTracks,
  getZones,
  listVideos,
  startProcessing,
  streamUrl,
} from '../../services/storeMonitorService';
import { useTheme } from '../../context/ThemeContext';
import { setCvStatus, resetCvStatus } from '../../utils/cvStatusBus';
import MonitorHeader from '../../components/monitoring/dual/MonitorHeader';
import StoreKpiRow from '../../components/monitoring/dual/StoreKpiRow';
import CameraPane from '../../components/monitoring/dual/CameraPane';
import CameraAnalytics from '../../components/monitoring/dual/CameraAnalytics';
import StoreIntelligence from '../../components/monitoring/dual/StoreIntelligence';
import DetectionTimeline from '../../components/monitoring/dual/DetectionTimeline';
import CameraInfoTable from '../../components/monitoring/dual/CameraInfoTable';
import ActivePeople from '../../components/monitoring/dual/ActivePeople';
import { onlyPeople } from '../../components/monitoring/dual/utils';

const CAM_IDS = ['camera_01', 'camera_02'];
const TRAIL_CAP = 80;

const blankCam = (id) => ({
  id,
  video: null,
  status: null,
  people: [],
  mapPeople: [],
  mapZones: [],
  events: [],
  zones: [],
  queue: null,
  time: 0,
  duration: 0,
  connected: false,
});

function toTwinPerson(p, camId) {
  return {
    id: p.id,
    cam: camId,
    class_id: 0,
    class_name: 'person',
    x: p.map?.x ?? p.x ?? 0,
    y: p.map?.y ?? p.y ?? 0,
    zone: p.zone || p.zone_name || '',
    zone_name: p.zone_name || p.zone || '',
    dwell: p.dwell,
    confidence: p.confidence,
  };
}

export default function LiveStoreMonitor() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === 'dark';
  const [cams, setCams] = useState({ camera_01: blankCam('camera_01'), camera_02: blankCam('camera_02') });
  const [summary, setSummary] = useState(null);
  const [sel, setSel] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [trails, setTrails] = useState({});

  const timeRef = useRef({ camera_01: 0, camera_02: 0 });
  const lastFast = useRef({ camera_01: 0, camera_02: 0 });

  const patchCam = useCallback((id, patch) => {
    setCams((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  // ---------- per-camera polling ----------

  const refreshFast = useCallback(async (id, t) => {
    try {
      const [tr, mp] = await Promise.all([getTracks(id, t), getMap(id, t)]);
      patchCam(id, {
        people: onlyPeople(tr.people || []),
        mapPeople: onlyPeople(mp.people || []),
        mapZones: mp.zones || [],
        connected: !!mp.connected,
      });
    } catch {
      /* ignore transient poll failures — per-camera state preserved */
    }
  }, [patchCam]);

  const refreshSlowCam = useCallback(async (id) => {
    const t = timeRef.current[id] || 0;
    try {
      const [st, e, z, q] = await Promise.all([
        getStatus(id),
        getEvents(id, t),
        getZones(id, t),
        getQueue(id, t),
      ]);
      patchCam(id, {
        status: st,
        events: e.items || e || [],
        zones: z.items || z || [],
        queue: q || null,
        connected: st?.state === 'ready',
      });
      return st;
    } catch {
      return null;
    }
  }, [patchCam]);

  const refreshSlow = useCallback(async () => {
    const [s1, s2] = await Promise.all([refreshSlowCam('camera_01'), refreshSlowCam('camera_02')]);
    try {
      const s = await getSummary(timeRef.current.camera_01 || 0, timeRef.current.camera_02 || 0);
      setSummary(s);
    } catch {
      /* summary unavailable — per-camera data still shown */
    }
    return [s1, s2];
  }, [refreshSlowCam]);

  const onTime = useCallback((id, t, dur, immediate = false) => {
    timeRef.current[id] = t;
    patchCam(id, { time: t, duration: dur || 0 });
    const now = Date.now();
    if (immediate || now - lastFast.current[id] > 500) {
      lastFast.current[id] = now;
      refreshFast(id, t);
    }
  }, [patchCam, refreshFast]);

  const ensureStarted = useCallback(async (id) => {
    try {
      const st = await getStatus(id);
      patchCam(id, { status: st, connected: st?.state === 'ready' });
      if ((st.state === 'idle' || st.state === 'error') && st.has_video !== false) {
        const started = await startProcessing(id);
        patchCam(id, { status: started, connected: started?.state === 'ready' });
      }
    } catch {
      /* status panel explains per-camera state */
    }
  }, [patchCam]);

  const boot = useCallback(async () => {
    setBootLoading(true);
    setBackendError('');
    const timer = setTimeout(() => setBootLoading(false), 2000);
    try {
      const v = await listVideos();
      const items = v.items || [];
      for (const id of CAM_IDS) {
        const meta = items.find((m) => m.camera_id === id) || null;
        patchCam(id, { video: meta });
      }
      await Promise.all(CAM_IDS.map((id) => ensureStarted(id)));
      await refreshSlow();
    } catch {
      setBackendError('Computer Vision Engine Unavailable — the backend could not be reached.');
    } finally {
      clearTimeout(timer);
      setBootLoading(false);
    }
  }, [ensureStarted, patchCam, refreshSlow]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await boot();
    })();
    return () => { cancelled = true; };
  }, [boot]);

  // Re-poll while either camera is still processing.
  const cam1State = cams.camera_01?.status?.state;
  const cam2State = cams.camera_02?.status?.state;
  useEffect(() => {
    const anyProcessing = cam1State === 'processing' || cam2State === 'processing';
    if (!anyProcessing) return undefined;
    const t = setInterval(() => {
      if (cam1State === 'processing') ensureStarted('camera_01');
      if (cam2State === 'processing') ensureStarted('camera_02');
    }, 3000);
    return () => clearInterval(t);
  }, [cam1State, cam2State, ensureStarted]);

  // Slow telemetry for both cameras + store summary.
  useEffect(() => {
    if (bootLoading) return undefined;
    const t = setInterval(() => refreshSlow(), 5000);
    return () => clearInterval(t);
  }, [bootLoading, refreshSlow]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await boot();
    } finally {
      setRefreshing(false);
    }
  }, [boot]);

  const handleRetry = useCallback(async (id) => {
    try {
      const v = await listVideos();
      const meta = (v.items || []).find((m) => m.camera_id === id) || null;
      patchCam(id, { video: meta });
    } catch {
      /* keep existing video state */
    }
    await ensureStarted(id);
    await refreshSlowCam(id);
  }, [ensureStarted, patchCam, refreshSlowCam]);

  const handleSelect = useCallback((camId, personId, globalId = null) => {
    setSel((prev) => {
      if (globalId && prev?.global_id === globalId) return null;
      if (prev?.cam === camId && String(prev?.id) === String(personId)) return null;
      return { cam: camId, id: personId, global_id: globalId };
    });
  }, []);

  // ---------- derived twin state (deduplicated by Global Person ID) ----------

  const twinPeople = useMemo(() => {
    if (summary?.global_people?.length > 0) {
      return summary.global_people.map((gp) => ({
        id: gp.global_id,
        global_id: gp.global_id,
        global_code: gp.global_code,
        global_label: gp.global_label,
        display_label: gp.display_label,
        cam: gp.active_cameras?.length > 1 ? 'both' : (gp.primary_cam || 'camera_01'),
        class_id: 0,
        class_name: 'person',
        x: gp.x ?? gp.map?.x ?? 0,
        y: gp.y ?? gp.map?.y ?? 0,
        zone: gp.zone || gp.zone_name || '',
        zone_name: gp.zone_name || gp.zone || '',
        dwell: gp.dwell,
        confidence: gp.confidence,
        is_merged: gp.is_merged,
        camera_tracks: gp.camera_tracks,
      }));
    }

    const seenGids = new Set();
    const out = [];
    for (const id of CAM_IDS) {
      const cam = cams[id];
      const base = cam.mapPeople?.length ? cam.mapPeople : cam.people;
      for (const p of base || []) {
        const gid = p.global_id || `${id}-${p.id}`;
        if (seenGids.has(gid)) continue;
        seenGids.add(gid);
        out.push({
          ...toTwinPerson(p, id),
          global_id: p.global_id,
          global_code: p.global_code,
          is_merged: p.is_merged,
        });
      }
    }
    return out;
  }, [cams, summary]);

  const activePeople = useMemo(() => {
    if (summary?.global_people?.length > 0) {
      return summary.global_people;
    }
    const seenGids = new Set();
    const out = [];
    for (const id of CAM_IDS) {
      for (const p of cams[id]?.people || []) {
        const gid = p.global_id;
        if (gid && seenGids.has(gid)) continue;
        if (gid) seenGids.add(gid);
        out.push({ ...p, cam: id });
      }
    }
    return out;
  }, [cams, summary]);

  useEffect(() => {
    if (twinPeople.length === 0) return;
    setTrails((prev) => {
      const next = { ...prev };
      for (const p of twinPeople) {
        if (p.x === undefined || p.y === undefined) continue;
        const key = `${p.cam}:${p.id}`;
        const cur = next[key] || [];
        const last = cur[cur.length - 1];
        if (!last || Math.abs(last.x - p.x) > 0.15 || Math.abs(last.y - p.y) > 0.15) {
          next[key] = [...cur, { x: p.x, y: p.y, zone: p.zone || p.zone_name || '' }].slice(-TRAIL_CAP);
        }
      }
      return next;
    });
  }, [twinPeople]);

  const camList = useMemo(() => CAM_IDS.map((id) => cams[id]), [cams]);
  const onlineCount = camList.filter((c) => c.status?.state === 'ready').length;
  const t1 = cams.camera_01.time;
  const t2 = cams.camera_02.time;
  const synced = cams.camera_01.duration > 0 && cams.camera_02.duration > 0 && Math.abs(t1 - t2) <= 1.0;
  const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const v1 = cams.camera_01.video;
    setCvStatus({
      connected: onlineCount > 0,
      processing: camList.some((c) => c.status?.state === 'processing'),
      progress: Math.round(camList.reduce((a, c) => a + (c.status?.progress || 0), 0) / Math.max(camList.length, 1)),
      fps: v1?.fps ?? null,
      resolution: v1?.width && v1?.height ? `${v1.width}×${v1.height}` : null,
      engine: 'YOLOv8 + ByteTrack',
    });
  }, [onlineCount, camList, cams]);
  useEffect(() => () => resetCvStatus(), []);

  if (bootLoading) return <Loading text="Connecting to Store Monitor backend..." />;

  if (backendError && onlineCount === 0 && !cams.camera_01.video && !cams.camera_02.video) {
    return (
      <PageContainer>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-14">
          <div className="max-w-sm mx-auto text-center space-y-3">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Computer Vision Engine Unavailable</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{backendError}</p>
            <button
              onClick={boot}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <MonitorHeader
          onlineCount={onlineCount}
          totalCameras={CAM_IDS.length}
          dateLabel={dateLabel}
          t1={t1}
          t2={t2}
          synced={synced}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* STORE KPI ROW */}
        <StoreKpiRow summary={summary} />

        {/* DUAL CCTV MONITORING — both feeds always visible */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
          {CAM_IDS.map((id) => (
            <CameraPane
              key={id}
              cam={cams[id]}
              people={cams[id].people}
              time={cams[id].time}
              duration={cams[id].duration}
              sel={sel}
              onSelectPerson={handleSelect}
              onTime={onTime}
              onRetry={handleRetry}
              streamUrl={streamUrl}
            />
          ))}
        </div>

        <CameraAnalytics cams={cams} summary={summary} />

        <ActivePeople
          people={activePeople}
          sel={sel}
          onSelect={handleSelect}
          onViewAll={() => navigate('/customer-analytics')}
        />

        <StoreIntelligence
          zones={cams.camera_01.zones}
          zonesReady={cams.camera_01.connected}
          summary={summary}
          cams={cams}
          onViewZones={() => navigate('/zone')}
        />

        {/* 3D & 2D DIGITAL TWIN STORE VIEW — in down side only */}
        <div>
          <Store3DView
            zones={cams.camera_01.mapZones?.length ? cams.camera_01.mapZones : cams.camera_01.zones}
            fallbackZones={cams.camera_01.zones}
            people={twinPeople}
            trails={trails}
            selectedId={sel ? (sel.global_id || sel.id) : null}
            onSelectPerson={(id) => {
              const match = twinPeople.find((p) => String(p.id) === String(id) || String(p.global_id) === String(id));
              if (match) handleSelect(match.cam, match.id, match.global_id);
            }}
            connected={onlineCount > 0}
            dark={dark}
          />
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Person markers: Deduplicated Global Person markers via Cross-Camera Re-ID · Single 3D twin avatar per unique visitor across both camera fields of view.
          </p>
        </div>

        <DetectionTimeline eventsByCam={{ camera_01: cams.camera_01.events, camera_02: cams.camera_02.events }} />

        <CameraInfoTable cams={cams} />
      </div>
    </PageContainer>
  );
}
