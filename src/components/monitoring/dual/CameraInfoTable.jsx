// Technical camera information: source, probe metadata and pipeline
// configuration per camera. Uploaded sources are never labeled 'live'.

import React from 'react';
import Panel, { EmptyNote, StatusDot } from './Panel';
import { CAMERA_META } from './utils';

function stateText(cam) {
  if (!cam.video) return { tone: 'red', text: 'OFFLINE' };
  const st = cam.status?.state;
  if (st === 'ready') return { tone: 'green', text: 'READY' };
  if (st === 'processing') return { tone: 'blue', text: `PROCESSING ${cam.status?.progress ?? 0}%` };
  if (st === 'error') return { tone: 'red', text: 'ERROR' };
  return { tone: 'amber', text: 'STANDBY' };
}

function CameraCard({ cam }) {
  const meta = CAMERA_META[cam.id] || { label: cam.id, role: '' };
  const st = stateText(cam);
  const d = cam.status?.detector || null;
  const rows = [
    ['Source', cam.video ? (cam.video.kind === 'live' ? 'Live Stream' : 'Uploaded Video') : 'Unavailable'],
    ['File', cam.video?.filename || 'Unavailable'],
    ['Resolution', cam.video?.width && cam.video?.height ? `${cam.video.width}×${cam.video.height}` : 'Unavailable'],
    ['FPS', cam.video?.fps ?? 'Unavailable'],
    ['Duration', cam.status?.duration ? `${Math.round(cam.status.duration)}s` : 'Unavailable'],
    ['Model', d ? `${d.model === 'yolov8n.pt' ? 'YOLOv8n' : d.model} (person class)` : 'Unavailable'],
    ['Tracker', d?.tracker || 'Unavailable'],
    ['Confidence', d ? `≥ ${d.confidence_threshold}` : 'Unavailable'],
    ['Frames indexed', cam.status?.frames_indexed ?? 'Unavailable'],
  ];
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 min-w-0">
      <p className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
        <StatusDot tone={st.tone} pulse={st.tone === 'green'} />
        {meta.label} <span className="font-medium text-slate-400 dark:text-slate-500">· {meta.role}</span>
      </p>
      <dl className="mt-3 space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-[11px]">
            <dt className="font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{k}</dt>
            <dd className="font-semibold text-slate-700 dark:text-slate-200 truncate font-mono">{String(v)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
          <dt className="font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</dt>
          <dd className="font-bold text-slate-700 dark:text-slate-200">{st.text}</dd>
        </div>
      </dl>
      {cam.status?.state === 'error' && cam.status?.error && (
        <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 break-words">{cam.status.error}</p>
      )}
    </div>
  );
}

export default function CameraInfoTable({ cams }) {
  const list = [cams?.camera_01, cams?.camera_02].filter(Boolean);
  return (
    <Panel title="Technical Camera Information" hint="Source files, probe metadata and detector configuration">
      {list.length === 0 ? (
        <EmptyNote message="Camera information unavailable — backend unreachable." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((cam) => <CameraCard key={cam.id} cam={cam} />)}
        </div>
      )}
    </Panel>
  );
}
