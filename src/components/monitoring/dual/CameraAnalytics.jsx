// Camera-specific analytics: side-by-side operator comparison of both
// feeds. Every metric is backend-reported for that camera.

import React from 'react';
import Panel, { EmptyNote, StatusDot } from './Panel';
import { CAMERA_META } from './utils';

function topZone(zones) {
  const list = zones || [];
  if (!list.length) return '—';
  const top = [...list].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
  return top.count > 0 ? `${top.name} (${top.count})` : '—';
}

function Row({ label, c1, c2 }) {
  return (
    <tr className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
      <td className="py-2 pr-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap">{label}</td>
      <td className="py-2 pr-3 text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">{c1}</td>
      <td className="py-2 text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">{c2}</td>
    </tr>
  );
}

export default function CameraAnalytics({ cams, summary }) {
  const c1 = cams?.camera_01;
  const c2 = cams?.camera_02;
  const s = summary?.cameras || {};
  const ready = c1?.status?.state === 'ready' || c2?.status?.state === 'ready';

  const conf = (cam) => {
    const v = s[cam.id]?.avg_confidence;
    if (!cam.connected || v === undefined || v === null) return 'Unavailable';
    return `${Math.round(Number(v) * 100)}%`;
  };
  const num = (cam, key) => (cam.connected && s[cam.id] ? s[cam.id][key] : 'Unavailable');

  return (
    <Panel
      title="Camera Analytics"
      hint="Per-feed detection and tracking performance — independent jobs, IDs never merged"
    >
      {!ready ? (
        <EmptyNote message="Waiting for analysis — per-camera metrics appear once processing is ready." />
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Metric</th>
                <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusDot tone={c1?.connected ? 'green' : 'red'} /> {CAMERA_META.camera_01.label}
                  </span>
                </th>
                <th className="py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusDot tone={c2?.connected ? 'green' : 'red'} /> {CAMERA_META.camera_02.label}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label="People detected" c1={c1?.people?.length ?? 'Unavailable'} c2={c2?.people?.length ?? 'Unavailable'} />
              <Row label="Active tracks" c1={num(c1, 'active_tracks')} c2={num(c2, 'active_tracks')} />
              <Row label="Avg confidence" c1={conf(c1)} c2={conf(c2)} />
              <Row label="Entries" c1={num(c1, 'entries')} c2={num(c2, 'entries')} />
              <Row label="Exits" c1={num(c1, 'exits')} c2={num(c2, 'exits')} />
              <Row label="Queue" c1={num(c1, 'queue_length')} c2={num(c2, 'queue_length')} />
              <Row label="FPS" c1={c1?.video?.fps ?? 'Unavailable'} c2={c2?.video?.fps ?? 'Unavailable'} />
              <Row label="Zone activity" c1={topZone(c1?.zones)} c2={topZone(c2?.zones)} />
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
