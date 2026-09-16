// Store intelligence: zone analytics (primary view), entry/exit + net
// flow, dwell analytics and queue analytics. Store-level numbers come
// from the /summary combined block; zones from the primary camera feed.

import React from 'react';
import Panel, { EmptyNote } from './Panel';
import { fmtDwell } from './utils';

function statusPill(status) {
  const map = {
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    crowded: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    busy: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    normal: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    empty: 'bg-slate-500/10 text-slate-400 dark:text-slate-500 border-slate-500/20',
  };
  return map[status] || map.empty;
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-lg leading-none font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export default function StoreIntelligence({ zones, zonesReady, summary, cams, onViewZones }) {
  const c = summary?.combined || null;
  const maxZone = Math.max(1, ...((zones || []).map((z) => z.count || 0)));
  const q1 = cams?.camera_01?.queue;
  const q2 = cams?.camera_02?.queue;
  const queueKnown = c !== null;
  const queueStatus = q1?.queue_status || q2?.queue_status || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* zones */}
      <Panel
        title="Zone Analytics"
        hint="Occupancy per store zone · Primary view (Camera 01)"
        action={(
          <button onClick={onViewZones} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            View all →
          </button>
        )}
      >
        {!zonesReady || !zones ? (
          <EmptyNote message="Waiting for analysis — zone occupancy appears once tracking is ready." />
        ) : (
          <div className="space-y-2.5">
            {zones.map((z) => (
              <div key={z.id || z.name} className="flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 w-28 truncate">{z.name}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${(z.count || 0) > 0 ? 'bg-emerald-500' : 'bg-transparent'}`}
                    style={{ width: `${Math.round(((z.count || 0) / maxZone) * 100)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-500 dark:text-slate-400 w-16 text-right tabular-nums">
                  {z.count ?? 0} {(z.count ?? 0) === 1 ? 'person' : 'people'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusPill(z.status)}`}>
                  {z.status || 'EMPTY'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* entry / exit */}
        <Panel title="Entry / Exit" hint="Crossing events, both feeds">
          {!c ? (
            <EmptyNote message="Unavailable — waiting for analysis." />
          ) : (
            <div className="space-y-2.5">
              <Stat label="Entries" value={c.entries} hint={`C1 ${summary.cameras.camera_01.entries} · C2 ${summary.cameras.camera_02.entries}`} />
              <Stat label="Exits" value={c.exits} hint={`C1 ${summary.cameras.camera_01.exits} · C2 ${summary.cameras.camera_02.exits}`} />
              <Stat label="Net store flow" value={`${c.net_flow >= 0 ? '+' : ''}${c.net_flow}`} hint="Entries minus exits" />
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          {/* dwell */}
          <Panel title="Dwell Analytics" hint="Tracked session duration">
            {!c ? (
              <EmptyNote message="Unavailable — waiting for analysis." />
            ) : (
              <div className="space-y-2.5">
                <Stat label="Average dwell" value={c.avg_dwell} />
                <Stat label="Longest dwell" value={fmtDwell(c.longest_dwell_secs)} />
                <Stat label="Active sessions" value={c.observations_now} hint="Currently observed" />
              </div>
            )}
          </Panel>

          {/* queue */}
          <Panel title="Queue Analytics" hint="Checkout zone occupancy">
            {!queueKnown ? (
              <EmptyNote message="Unavailable for current camera configuration." />
            ) : (
              <div className="space-y-2.5">
                <Stat label="Queue length" value={`${c.queue_length} ${c.queue_length === 1 ? 'person' : 'people'}`} hint={`C1 ${q1?.current_queue ?? '—'} · C2 ${q2?.current_queue ?? '—'}`} />
                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">Queue status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusPill((queueStatus || 'normal').toLowerCase())}`}>
                    {queueStatus || 'NORMAL'}
                  </span>
                </div>
                {(q1?.estimated_wait_time || q2?.estimated_wait_time) && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Est. wait — C1 {q1?.estimated_wait_time || '—'} · C2 {q2?.estimated_wait_time || '—'}
                  </p>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
