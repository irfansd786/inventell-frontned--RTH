// Dwell Time Analytics — wide section with mini metrics, distribution
// bars and a dynamically calculated bottom-line insight.

import React, { useMemo } from 'react';
import { Hourglass } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function DwellAnalyticsCard({ dwell, hasData }) {
  const { total, leader } = useMemo(() => {
    const dist = dwell?.distribution || [];
    const t = dist.reduce((acc, b) => acc + (b.count || 0), 0);
    const top = dist.reduce((best, b) => ((b.count || 0) > (best?.count || -1) ? b : best), null);
    return { total: t, leader: top && top.count > 0 ? top : null };
  }, [dwell]);

  return (
    <SectionCard
      icon={Hourglass}
      title="Dwell Time Analytics"
      subtitle="Understand how long customers spend inside the store"
      className="h-full"
      source="CCTV Tracking · Camera 01 + Camera 02"
    >
      {!hasData || !dwell ? (
        <EmptyState compact message="Insufficient tracking history for dwell distribution." />
      ) : (
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Average Dwell', value: dwell.average },
              { label: 'Median Dwell', value: dwell.median },
              { label: 'Longest Dwell', value: dwell.longest },
            ].map((d) => (
              <div key={d.label} className="rounded-md bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 px-2.5 py-2">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{d.label}</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">Dwell Time Distribution</p>
            <div className="space-y-1.5">
              {(dwell.distribution || []).map((b) => {
                const pct = total > 0 ? Math.round(((b.count || 0) / total) * 100) : 0;
                return (
                  <div key={b.bucket} className="grid grid-cols-[68px_1fr_32px_36px] items-center gap-2 text-[11px]">
                    <span className="font-medium text-slate-600 dark:text-slate-300 truncate">{b.bucket}</span>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-right text-slate-400 dark:text-slate-500 tabular-nums">{b.count || 0}</span>
                    <span className="text-right font-bold text-slate-800 dark:text-slate-100 tabular-nums">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
            {leader
              ? <>Most tracked sessions fall within <strong className="text-blue-700 dark:text-blue-300 font-bold">{leader.bucket}</strong> ({Math.round((leader.count / total) * 100)}% of total sessions).</>
              : 'Insufficient tracking history for dwell distribution.'}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
