// Customer Activity by Hour — compact professional table.
// TIME / VISITORS / AVG. DWELL / ACTIVITY with peak-row highlight.
// All rows come from backend activity bins.

import React from 'react';
import { ListOrdered } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function ActivityByHour({ activity, peakPeriod }) {
  const hasActivity = (activity || []).length > 0;
  const maxBin = Math.max(1, ...(activity || []).map((b) => b.visitors || 0));

  return (
    <SectionCard
      icon={ListOrdered}
      title="Customer Activity by Hour"
      subtitle="Visitors and average dwell"
      className="h-full"
      source="CCTV Tracking"
    >
      {!hasActivity ? (
        <EmptyState compact message="No activity breakdown for the selected period." />
      ) : (
        <div className="overflow-y-auto max-h-64 flex-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 shadow-2xs">
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="py-1.5 pr-1 font-bold">TIME</th>
                <th className="py-1.5 px-1 font-bold text-right">VISITORS</th>
                <th className="py-1.5 px-1 font-bold text-right">AVG. DWELL</th>
                <th className="py-1.5 pl-1 font-bold text-right">ACTIVITY</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((row) => {
                const isPeak = peakPeriod && row.label === peakPeriod.label && row.visitors > 0;
                return (
                  <tr
                    key={row.label}
                    className={`border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${
                      isPeak ? 'bg-amber-500/[0.08] dark:bg-amber-500/15 font-semibold' : ''
                    }`}
                  >
                    <td className="py-1.5 pr-1 font-mono text-[10px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {row.label}
                      {isPeak && (
                        <span className="ml-1 px-1 py-px rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Peak
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-1 text-right font-bold text-slate-900 dark:text-white tabular-nums text-xs">
                      {row.visitors}
                    </td>
                    <td className="py-1.5 px-1 text-right text-slate-500 dark:text-slate-400 tabular-nums text-[11px] whitespace-nowrap">
                      {row.avg_dwell_secs}s
                    </td>
                    <td className="py-1.5 pl-1 text-right w-12 sm:w-14">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPeak ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.round((row.visitors / maxBin) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
