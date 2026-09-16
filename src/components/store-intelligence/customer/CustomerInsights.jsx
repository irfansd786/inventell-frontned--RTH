// Customer Insights — compact intelligence panel.
// Each card: title, evidence text (with real numbers from the backend),
// and a category derived deterministically from the insight topic.
// Nothing is generated client-side beyond presentation.

import React from 'react';
import { Sparkles } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

function categoryOf(insight = {}) {
  const t = `${insight.title || ''}`.toLowerCase();
  if (t.includes('checkout') || t.includes('queue') || t.includes('capacity')) {
    return { label: 'Operations', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25' };
  }
  if (t.includes('dwell') || t.includes('attention')) {
    return { label: 'Dwell', cls: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25' };
  }
  if (t.includes('zone') || t.includes('footfall')) {
    return { label: 'Zone', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' };
  }
  if (t.includes('engagement')) {
    return { label: 'Engagement', cls: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25' };
  }
  if (t.includes('peak') || t.includes('traffic') || t.includes('rush') || t.includes('journey')) {
    return { label: 'Traffic', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25' };
  }
  return { label: 'Engagement', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
}

export default function CustomerInsights({ insights }) {
  const list = insights || [];
  return (
    <SectionCard
      icon={Sparkles}
      title="Customer Insights"
      subtitle="Data-driven behavior patterns"
      className="h-full"
      source="CCTV Tracking"
    >
      {list.length === 0 || (list.length === 1 && list[0].text === 'Insufficient data for this insight.') ? (
        <EmptyState compact message="Insufficient data for insights." />
      ) : (
        <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {list.map((ins) => {
            const cat = categoryOf(ins);
            return (
              <li key={ins.id} className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2.5 bg-slate-50/40 dark:bg-slate-800/30">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{ins.title || 'Insight'}</p>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cat.cls}`}>{cat.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 mt-1">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Evidence: </span>
                  {ins.text}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
