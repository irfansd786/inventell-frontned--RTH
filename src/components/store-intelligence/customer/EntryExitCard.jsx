// Entry vs Exit — compact traffic comparison.
// ENTRY / EXIT values plus Net Flow (entries − exits), which the backend
// legitimately supports. Clean proportional bars, no decoration.

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function EntryExitCard({ summary, hasData }) {
  const entries = summary?.entries ?? 0;
  const exits = summary?.exits ?? 0;
  const net = entries - exits;
  const max = Math.max(1, entries, exits);

  const totalFlow = entries + exits;
  const entryShare = totalFlow > 0 ? Math.round((entries / totalFlow) * 100) : 50;
  const exitShare = totalFlow > 0 ? 100 - entryShare : 50;

  return (
    <SectionCard
      icon={ArrowLeftRight}
      title="Entry vs Exit"
      subtitle="Session starts vs completions"
      className="h-full"
      source="CCTV Tracking"
    >
      {!hasData ? (
        <EmptyState compact message="No entry/exit data for the selected period." />
      ) : (
        <div className="space-y-2.5 flex flex-col justify-between h-full">
          {/* Dual bar proportional balance */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-blue-600 dark:text-blue-400">ENTRY ({entryShare}%)</span>
              <span className="text-amber-600 dark:text-amber-400">EXIT ({exitShare}%)</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${entryShare}%` }} />
              <div className="bg-amber-500 h-full transition-all" style={{ width: `${exitShare}%` }} />
            </div>
          </div>

          {/* Metric blocks */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                ENTRY
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {entries}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                Session starts
              </span>
            </div>

            <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                EXIT
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {exits}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                Session ends
              </span>
            </div>
          </div>

          {/* Net Flow calculation */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Net Flow
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Entries − Exits
              </span>
            </div>
            <span
              className={`text-lg font-bold tabular-nums px-2 py-0.5 rounded-md ${
                net >= 0
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/10 text-red-700 dark:text-red-300'
              }`}
            >
              {net >= 0 ? `+${net}` : net}
            </span>
          </div>

          {summary?.entry_zone_visitors === 0 && summary?.exit_zone_visitors === 0 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
              No tracks crossed designated perimeter zones in this session.
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
