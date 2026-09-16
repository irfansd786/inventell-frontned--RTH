// Store-level KPI row from the /summary combined block.
// Combined camera observations — explicitly not deduplicated persons.

import React from 'react';
import { Users, LogIn, LogOut, Gauge, Clock, AlertTriangle } from 'lucide-react';

export default function StoreKpiRow({ summary }) {
  const c = summary?.combined || null;
  const val = (v, suffix = '') => (c ? `${v}${suffix}` : 'Unavailable');

  const cards = [
    {
      icon: Users,
      label: 'People in Store',
      value: val(c?.observations_now ?? '—'),
      hint: summary?.cross_camera_matching ? 'Deduplicated (Global IDs)' : 'Combined camera observations',
    },
    { icon: LogIn, label: 'Entry Count', value: val(c?.entries ?? '—'), hint: 'Unique visitors entered' },
    { icon: LogOut, label: 'Exit Count', value: val(c?.exits ?? '—'), hint: 'Completed sessions' },
    { icon: Gauge, label: 'Current Occupancy', value: val(c?.occupancy_pct ?? '—', '%'), hint: 'Store capacity utilization' },
    { icon: Clock, label: 'Average Dwell', value: c ? c.avg_dwell : 'Unavailable', hint: 'Continuous multi-cam dwell' },
    { icon: AlertTriangle, label: 'Queue Length', value: val(c?.queue_length ?? '—'), hint: 'Checkout zones (deduplicated)' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((k) => (
          <div
            key={k.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center gap-2">
              <k.icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 truncate">{k.label}</p>
            </div>
            <p className="mt-2 text-[22px] leading-none font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {k.value}
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">{k.hint}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
        Store-level intelligence derived from both cameras. {summary?.note || 'Cross-Camera Re-ID deduplicates multi-camera visitors into true store occupancy.'}
      </p>
    </div>
  );
}
