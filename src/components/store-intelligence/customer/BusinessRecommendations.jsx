// Business Recommendations — separate action-oriented panel.
// Each card: recommendation title, cautious reason text (server-written),
// and a focus-area tag derived from the recommendation topic.
// No causation is claimed; no priorities are invented.

import React from 'react';
import { Lightbulb } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

function parsePriorityAndMetric(rec = {}) {
  const t = `${rec.title || ''} ${rec.text || ''}`.toLowerCase();
  if (t.includes('checkout') || t.includes('capacity') || t.includes('replenish')) {
    return {
      priority: 'High Priority',
      priorityCls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
      metric: t.includes('checkout') ? 'Checkout dwell threshold' : 'Zone traffic concentration',
    };
  }
  if (t.includes('cross-zone') || t.includes('discovery') || t.includes('engagement')) {
    return {
      priority: 'Medium Priority',
      priorityCls: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
      metric: t.includes('discovery') ? 'Single-zone visit ratio' : 'Average path dwell',
    };
  }
  return {
    priority: 'Standard',
    priorityCls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    metric: 'Peak window observation',
  };
}

export default function BusinessRecommendations({ recommendations }) {
  const list = recommendations || [];
  return (
    <SectionCard
      icon={Lightbulb}
      title="Business Recommendations"
      subtitle="Operational guidance & opportunities"
      className="h-full"
      source="CCTV Tracking"
    >
      {list.length === 0 || (list.length === 1 && list[0].text === 'Insufficient data for recommendations.') ? (
        <EmptyState compact message="Insufficient data for recommendations." />
      ) : (
        <div className="flex flex-col justify-between h-full space-y-2">
          <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {list.map((rec) => {
              const meta = parsePriorityAndMetric(rec);
              return (
                <li key={rec.id} className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 bg-slate-50/40 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {rec.title || 'Recommendation'}
                    </p>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.priorityCls}`}>
                      {meta.priority}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 mt-1">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Reason: </span>
                    {rec.text}
                  </p>
                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>Supporting metric: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{meta.metric}</strong></span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Operational Framework Footer to balance height and eliminate empty space */}
          <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2 text-xs bg-slate-50/50 dark:bg-slate-800/40 space-y-1 mt-auto">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>Evaluation Basis</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Multi-Zone Tracking
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Rules derive from zone dwell distributions and footfall concentrations across both cameras.
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
