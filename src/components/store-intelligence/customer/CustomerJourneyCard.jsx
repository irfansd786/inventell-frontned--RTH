// Customer Journeys — visual journey-flow of the most common observed
// path plus a ranked list with real shares. "View All" expands the full
// backend journey list. No fabricated journeys.

import React, { useState } from 'react';
import { Route } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

function FlowChips({ path }) {
  const steps = String(path || '').split(' → ').filter(Boolean);
  if (steps.length === 0) return <span className="text-[11px] text-slate-400">—</span>;
  return (
    <div className="flex items-center gap-1.5 flex-wrap" aria-label={`Journey: ${path}`}>
      {steps.map((step, i) => (
        <React.Fragment key={`${step}-${i}`}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600 font-bold" aria-hidden="true">→</span>}
          <span className={`px-2 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${
            i === 0
              ? 'bg-blue-500/[0.07] dark:bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-200'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {step}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CustomerJourneyCard({ journeys, hasData }) {
  const [showAll, setShowAll] = useState(false);
  const list = journeys || [];
  const top = list[0];
  const ranked = showAll ? list : list.slice(0, 3);

  return (
    <SectionCard
      icon={Route}
      title="Customer Journeys"
      subtitle="Most common paths through the store"
      className="h-full"
      source="CCTV Tracking · Camera 01 + Camera 02"
      action={
        list.length > 3 && (
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
        <EmptyState compact message="Not enough movement data to calculate customer journeys." />
      ) : (
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="rounded-md bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Most common journey</p>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {top.count} customers · {top.share}%
              </p>
            </div>
            <FlowChips path={top.path} />
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">Most Common Journeys</p>
            <div className="space-y-2">
              {ranked.map((j, i) => (
                <div
                  key={`${j.path}-${i}`}
                  className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 flex items-center justify-between gap-3 text-xs bg-slate-50/40 dark:bg-slate-800/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      Rank {i + 1}
                    </span>
                    <span className="truncate font-semibold text-slate-700 dark:text-slate-200" title={j.path}>
                      {j.path}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {j.share}%
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
                      {j.count} sess.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
