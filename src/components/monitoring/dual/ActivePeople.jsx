// Active people across both feeds: anonymous person cards with zone,
// dwell, confidence and factual movement state. Selection syncs with
// the video overlays and the 3D twin.

import React from 'react';
import Panel, { EmptyNote } from './Panel';
import { fmtDwell, confLabel, movementState, CAMERA_META } from './utils';

export default function ActivePeople({ people, sel, onSelect, onViewAll }) {
  return (
    <Panel
      title={`Active People (${(people || []).length})`}
      hint="Store-level deduplicated persons with Global IDs · Cross-Camera Re-ID synchronized"
      action={(
        <button onClick={onViewAll} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          View all →
        </button>
      )}
    >
      {(people || []).length === 0 ? (
        <EmptyNote message="No people currently observed — tracked persons appear here during analysis." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {people.map((p) => {
            const gid = p.global_id ?? (p.id || 0);
            const globalLabel = p.global_label || `GLOBAL ${String(gid).padStart(3, '0')}`;
            const key = `global-${gid}-${p.cam || 'all'}-${p.id}`;

            const isMerged = !!p.is_merged || (p.active_cameras && p.active_cameras.length > 1);
            const activeCamLabel = p.active_cameras_label || (isMerged ? 'BOTH CAMERAS' : (CAMERA_META[p.cam]?.label || p.cam));
            
            // Build local track references: e.g. C1-103, C2-108
            let trackRefs = '';
            if (p.camera_tracks && Object.keys(p.camera_tracks).length > 0) {
              trackRefs = Object.entries(p.camera_tracks)
                .map(([c, tid]) => `${c === 'camera_01' ? 'C1' : 'C2'}-${tid}`)
                .join(', ');
            } else if (p.cam && p.id) {
              trackRefs = `${p.cam === 'camera_01' ? 'C1' : 'C2'}-${p.id}`;
            }

            const active = (sel?.cam === p.cam && String(sel?.id) === String(p.id)) ||
              (sel?.global_id && String(sel?.global_id) === String(gid));

            return (
              <button
                key={key}
                onClick={() => onSelect(p.cam || (p.active_cameras ? p.active_cameras[0] : 'camera_01'), p.primary_track_id || p.id, gid)}
                aria-pressed={active}
                className={`p-3 rounded-lg border text-left text-xs cursor-pointer transition-all ${
                  active
                    ? 'border-emerald-500 bg-emerald-500/[0.08] dark:bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : isMerged
                    ? 'border-purple-500/40 bg-purple-500/[0.03] dark:bg-purple-500/10 hover:border-purple-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                {/* Header: Global Person ID + Camera Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-slate-900 dark:text-white truncate">
                      {globalLabel}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                      isMerged
                        ? 'bg-purple-600 text-white shadow-sm'
                        : p.cam === 'camera_01' || p.active_cameras?.[0] === 'camera_01'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeCamLabel}
                  </span>
                </div>

                {/* Sub-label: Local Camera Tracks */}
                {trackRefs && (
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Tracks: <span className="font-bold text-slate-700 dark:text-slate-300">{trackRefs}</span>
                  </p>
                )}

                {/* Zone Name */}
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate mt-1">
                  {p.zone_name || p.zone || 'Store Floor'}
                </p>

                {/* Dwell & Re-ID Match Info */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  <span>{fmtDwell(p.dwell)}</span>
                  {isMerged && p.match_confidence ? (
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      Re-ID: {Math.round((p.match_confidence <= 1.0 ? p.match_confidence * 100 : p.match_confidence))}%
                    </span>
                  ) : (
                    <span>{confLabel(p)}</span>
                  )}
                </div>

                {/* Movement State Pill */}
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                    {movementState(p)}
                  </span>
                  {isMerged && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Merged
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
