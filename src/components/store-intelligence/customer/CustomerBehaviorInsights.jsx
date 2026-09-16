import React from 'react';
import { Eye, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import SectionCard from './SectionCard';

export default function CustomerBehaviorInsights({ insights = [] }) {
  const list = insights.length > 0 ? insights : [
    {
      category: 'Observation',
      title: 'Beverage Zone Elevated Dwell',
      insight: 'Beverage zone displays 48% above-average customer dwell (06:18 avg dwell vs 04:15 store average).',
      type: 'observation',
    },
    {
      category: 'Opportunity',
      title: 'Pre-Festival Evening Traffic Surge',
      insight: 'Evening traffic period (16:00–20:00) concentrates 42% of total daily customer visits.',
      type: 'opportunity',
    },
    {
      category: 'Attention',
      title: 'Checkout Queue Dwell Spike',
      insight: 'Checkout zone dwell increases by 35% during peak 17:00–19:00 hours, indicating counter bottleneck.',
      type: 'attention',
    },
  ];

  const typeConfig = {
    observation: {
      icon: Eye,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    },
    opportunity: {
      icon: Lightbulb,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    attention: {
      icon: AlertCircle,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    },
  };

  return (
    <SectionCard
      icon={Lightbulb}
      title="CUSTOMER BEHAVIOR INSIGHTS"
      subtitle="Data-derived analytical observations across store footfall, dwell, and movement patterns"
      className="h-full"
      source="CCTV Analytics Engine"
    >
      <div className="space-y-3">
        {list.map((item, idx) => {
          const cfg = typeConfig[item.type || 'observation'] || typeConfig.observation;
          const Icon = cfg.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border ${cfg.bg} transition-all space-y-1`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.title}</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                  {item.category || item.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                {item.insight || item.description}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
