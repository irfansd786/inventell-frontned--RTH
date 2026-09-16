// Peak Activity — compact panel beside the traffic chart.
// Real busiest window, peak visitors and peak occupancy from the backend.

import React from 'react';
import { Clock } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function PeakActivity({ peakPeriod, summary, cameras, hasData }) {
  if (!hasData) {
    return (
      <SectionCard icon={Clock} title="Peak Activity" subtitle="Busiest period and occupancy" className="h-full">
        <EmptyState compact message="Awaiting CCTV analysis." />
      </SectionCard>
    );
  }

  const cam1Tracks = cameras?.camera_01?.tracks ?? 0;
  const cam2Tracks = cameras?.camera_02?.tracks ?? 0;

  return (
    <SectionCard
      icon={Clock}
      title="Peak Activity"
      subtitle="Busiest period and occupancy"
      className="h-full"
      source="CCTV Tracking"
    >
      <div className="flex flex-col justify-between h-full space-y-2.5">
        {/* Peak Period highlighted banner */}
        <div className="rounded-md bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Peak Traffic Period
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {peakPeriod ? peakPeriod.label : 'No peak recorded'}
          </p>
        </div>

        {/* 2-column metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2.5 bg-slate-50/40 dark:bg-slate-800/30">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
              {peakPeriod ? peakPeriod.visitors : 0}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Visitors
            </p>
          </div>

          <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2.5 bg-slate-50/40 dark:bg-slate-800/30">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
              {summary?.peak_occupancy ?? 0}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate" title={summary?.peak_occupancy_time ? `at ${summary.peak_occupancy_time}` : ''}>
              Peak Occupancy{summary?.peak_occupancy_time ? ` · ${summary.peak_occupancy_time}` : ''}
            </p>
          </div>
        </div>

        {/* Camera observation telemetry */}
        <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 text-xs space-y-1 bg-slate-50/30 dark:bg-slate-800/20">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Camera 01 Observations</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{cam1Tracks} tracks</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Camera 02 Observations</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{cam2Tracks} tracks</span>
          </div>
        </div>

        {/* Current occupancy indicator */}
        <div className="flex items-center justify-between px-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Current Store Occupancy</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {summary?.current_occupancy ?? 0} active
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
