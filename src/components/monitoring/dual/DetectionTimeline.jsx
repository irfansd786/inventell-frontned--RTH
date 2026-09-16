// Detection timeline: merged chronological events from both cameras,
// each tagged with its source feed and that feed's analysis time.

import React, { useMemo } from 'react';
import Panel, { EmptyNote } from './Panel';
import { CAMERA_META } from './utils';

const KIND_STYLE = {
  enter: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  zone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
  dwell: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
  queue: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
};

function kindLabel(kind) {
  if (kind === 'enter') return 'Entered';
  if (kind === 'zone') return 'Moved';
  if (kind === 'dwell') return 'Long dwell';
  if (kind === 'queue') return 'Queue';
  return kind || 'Event';
}

export default function DetectionTimeline({ eventsByCam }) {
  const merged = useMemo(() => {
    const all = [];
    for (const [camId, events] of Object.entries(eventsByCam || {})) {
      for (const e of events || []) {
        all.push({ ...e, camId });
      }
    }
    all.sort((a, b) => (b.t ?? 0) - (a.t ?? 0));
    return all.slice(0, 20);
  }, [eventsByCam]);

  return (
    <Panel title="Detection Timeline" hint="Chronological tracking events · per-feed analysis time">
      {merged.length === 0 ? (
        <EmptyNote message="No tracking events yet — events appear once analysis produces track history." />
      ) : (
        <ol className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-80 overflow-y-auto -my-1">
          {merged.map((e, i) => (
            <li key={`${e.camId}-${e.t}-${e.person_id}-${i}`} className="flex items-center gap-3 py-2.5">
              <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0 w-12">
                {e.time || '—'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                {CAMERA_META[e.camId]?.label || e.camId}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 shrink-0">
                {e.person_id !== undefined && e.person_id !== null ? `Person ${e.person_id}` : 'System'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{e.text}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${KIND_STYLE[e.kind] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                {kindLabel(e.kind)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
