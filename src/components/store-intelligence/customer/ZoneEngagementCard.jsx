// Zone Engagement — professional table, not colored cards.
// ZONE / VISITORS / AVG. DWELL / TRAFFIC SHARE / ACTIVITY.
// Activity pills are data-driven from backend traffic-share thresholds.

import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

const LEVEL_STYLE = {
  'High activity': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Moderate activity': 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  'Low activity': 'bg-red-500/10 text-red-600 dark:text-red-400',
  Empty: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
};

function levelLabel(level) {
  if (level === 'High activity') return 'High';
  if (level === 'Moderate activity') return 'Medium';
  if (level === 'Low activity') return 'Low';
  return '—';
}

export default function ZoneEngagementCard({ zones, hasData, selectedZone, onSelectZone }) {
  const [expanded, setExpanded] = useState(false);
  const list = zones || [];
  const visible = expanded ? list : list.slice(0, 6);
  const detail = selectedZone ? list.find((z) => z.id === selectedZone) : null;

  return (
    <SectionCard
      icon={LayoutGrid}
      title="Zone Engagement"
      subtitle="Visitor count, dwell time and activity by zone"
      className="h-full"
      source="CCTV Tracking"
    >
      {!hasData || list.length === 0 ? (
        <EmptyState compact message="No zone activity for the selected period." />
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-1.5 pr-2 font-bold w-6">#</th>
                  <th className="py-1.5 pr-2 font-bold">ZONE</th>
                  <th className="py-1.5 pr-2 font-bold text-right">VISITORS</th>
                  <th className="py-1.5 pr-2 font-bold text-right">AVG. DWELL</th>
                  <th className="py-1.5 pr-2 font-bold text-right">TRAFFIC SHARE</th>
                  <th className="py-1.5 font-bold text-right">ACTIVITY</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((z, i) => {
                  const active = selectedZone === z.id;
                  return (
                    <tr
                      key={z.id}
                      onClick={() => onSelectZone(active ? null : z.id)}
                      className={`border-b border-slate-50 dark:border-slate-800/60 last:border-0 cursor-pointer ${
                        active ? 'bg-blue-500/[0.06] dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="py-1.5 pr-2 text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                      <td className="py-1.5 pr-2 font-semibold text-slate-800 dark:text-slate-100">{z.name}</td>
                      <td className="py-1.5 pr-2 text-right font-bold text-slate-900 dark:text-white tabular-nums">{z.visitors}</td>
                      <td className="py-1.5 pr-2 text-right text-slate-500 dark:text-slate-400 tabular-nums">{z.avg_dwell}</td>
                      <td className="py-1.5 pr-2 text-right text-slate-500 dark:text-slate-400 tabular-nums">{z.traffic_share}%</td>
                      <td className="py-1.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${LEVEL_STYLE[z.activity_level] || LEVEL_STYLE.Empty}`}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {levelLabel(z.activity_level)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {detail && (
            <p className="mt-2 px-2.5 py-2 rounded-md bg-blue-500/[0.06] dark:bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-600 dark:text-slate-300" role="status">
              <strong className="text-slate-900 dark:text-white">{detail.name}</strong>
              {' — '}{detail.visitors} visitors · {detail.avg_dwell} avg dwell · {detail.traffic_share}% traffic share · {detail.current_occupancy} currently inside
            </p>
          )}
          {list.length > 6 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {expanded ? 'Show less ↑' : `View all ${list.length} zones →`}
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}
