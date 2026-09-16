// Page header: title, analysis clock, cameras-active pill, refresh.
// No camera selector — both feeds are always live.

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { StatusDot } from './Panel';
import { fmtClock as fmt } from './utils';

export default function MonitorHeader({ onlineCount, totalCameras, dateLabel, t1, t2, synced, onRefresh, refreshing }) {
  const allOnline = onlineCount === totalCameras && totalCameras > 0;
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Live Store Monitor
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Computer vision powered store monitoring and customer movement intelligence.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-mono" title="Analysis time per camera">
          {dateLabel} · CAM1 {fmt(t1)} · CAM2 {fmt(t2)}
        </span>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold ${
            allOnline
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
          }`}
          role="status"
          title={synced ? 'Both analysis timelines within 1s' : 'Cameras run on independent timelines'}
        >
          <StatusDot tone={allOnline ? 'green' : 'amber'} pulse={allOnline} />
          {onlineCount} / {totalCameras} CAMERAS ACTIVE{synced ? ' · IN SYNC' : ''}
        </span>
        <button
          onClick={onRefresh}
          disabled={!!refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
