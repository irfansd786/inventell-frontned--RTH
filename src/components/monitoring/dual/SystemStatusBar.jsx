// Compact technical status strip: engine, model, tracker, threshold,
// cameras online, processing state, FPS and resolution. Every value is
// backend-reported; missing values render as 'Unavailable'.

import React from 'react';
import Panel, { StatusDot } from './Panel';

function Cell({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">{label}</p>
      <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{children}</div>
    </div>
  );
}

function fmtEngine(engine, model) {
  if (engine === 'yolo') return `YOLOv8 — Person Detection${model && model !== 'yolov8n.pt' ? ` (${model})` : ''}`;
  if (engine === 'motion') return 'Motion Fallback — Person Shape Gates';
  if (engine && engine !== 'unknown' && engine !== 'unavailable') return engine;
  return 'Unavailable';
}

export default function SystemStatusBar({ cameras }) {
  const list = cameras || [];
  const online = list.filter((c) => c.status?.state === 'ready');
  const processing = list.filter((c) => c.status?.state === 'processing');
  const ready = online[0]?.status;
  const detector = ready?.detector || processing[0]?.status?.detector || null;

  const fpsVals = list.map((c) => c.video?.fps).filter((v) => v !== undefined && v !== null);
  const fpsLabel = fpsVals.length === 0 ? 'Unavailable'
    : fpsVals.length === 1 ? `${fpsVals[0]} fps`
    : (Math.min(...fpsVals) === Math.max(...fpsVals) ? `${fpsVals[0]} fps` : `${Math.min(...fpsVals)}–${Math.max(...fpsVals)} fps`);
  const resVals = [...new Set(list.map((c) => (c.video?.width && c.video?.height) ? `${c.video.width}×${c.video.height}` : null).filter(Boolean))];
  const resLabel = resVals.length === 0 ? 'Unavailable' : resVals.join(' · ');

  return (
    <Panel title="Computer Vision Engine" hint="Backend-reported pipeline state — YOLO person class only">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-x-4 gap-y-3">
        <Cell label="Engine">
          <span className="inline-flex items-center gap-1.5">
            <StatusDot tone={online.length > 0 ? 'green' : processing.length > 0 ? 'blue' : 'red'} pulse={online.length > 0} />
            {online.length > 0 ? 'ACTIVE' : processing.length > 0 ? 'PROCESSING' : 'UNAVAILABLE'}
          </span>
        </Cell>
        <Cell label="Model">{detector ? fmtEngine(ready?.engine || processing[0]?.status?.engine, detector.model) : 'Unavailable'}</Cell>
        <Cell label="Tracker">{detector?.tracker || 'Unavailable'}</Cell>
        <Cell label="Person threshold">{detector ? `≥ ${detector.confidence_threshold}` : 'Unavailable'}</Cell>
        <Cell label="Cameras">{`${online.length} / ${list.length} Online`}</Cell>
        <Cell label="FPS">{fpsLabel}</Cell>
        <Cell label="Resolution">{resLabel}</Cell>
      </div>
    </Panel>
  );
}
