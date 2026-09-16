// Zone Transitions — compact professional table.
// FROM / TO / CUSTOMERS / SHARE with directional arrows.
// Share is real arithmetic over observed transition counts.

import React, { useState } from 'react';
import { ArrowRight, Shuffle } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function ZoneTransitionTable({ transitions, hasData }) {
  const [showAll, setShowAll] = useState(false);
  const list = transitions || [];
  const total = list.reduce((a, t) => a + (t.count || 0), 0);
  const visible = showAll ? list : list.slice(0, 6);
  const topCount = Math.max(1, ...list.map((t) => t.count || 0));

  return (
    <SectionCard
      icon={Shuffle}
      title="Zone Transitions"
      subtitle="Customer movement between zones"
      className="h-full"
      source="CCTV Tracking"
      action={
        list.length > 6 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
          >
            {showAll ? 'Show less ↑' : 'View All →'}
          </button>
        )
      }
    >
      {!hasData || list.length === 0 ? (
        <EmptyState compact message="Not enough movement data for transitions." />
      ) : (
        <div className="flex flex-col justify-between h-full overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[300px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="py-1.5 pr-2 font-bold">FROM</th>
                <th className="py-1.5 pr-2 font-bold">TO</th>
                <th className="py-1.5 pr-2 font-bold text-right">CUSTOMERS</th>
                <th className="py-1.5 font-bold text-right">SHARE</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tr, i) => {
                const share = total > 0 ? (tr.count / total) * 100 : 0;
                const hot = tr.count === topCount && tr.count > 0;
                return (
                  <tr
                    key={`${tr.from}-${tr.to}-${i}`}
                    className={`border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${
                      hot ? 'bg-blue-500/[0.04] dark:bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {tr.from_name}
                      {hot && (
                        <span className="ml-1.5 px-1 py-px rounded text-[9px] font-bold uppercase bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          Top
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 font-medium text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="whitespace-nowrap">{tr.to_name}</span>
                      </span>
                    </td>
                    <td className={`py-1.5 pr-2 text-right font-bold tabular-nums ${hot ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                      {tr.count}
                    </td>
                    <td className="py-1.5 text-right text-slate-500 dark:text-slate-400 tabular-nums">{share.toFixed(1)}%</td>
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
