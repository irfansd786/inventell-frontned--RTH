import React from 'react';
import { Trophy, Flame, Compass, BarChart2 } from 'lucide-react';
import SectionCard from './SectionCard';

function MiniPanel({ icon: Icon, title, name, metric }) {
  return (
    <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-2.5 bg-slate-50/50 dark:bg-slate-800/40">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        {title}
      </p>
      {name ? (
        <>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight mt-1 truncate">
            {name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {metric}
          </p>
        </>
      ) : (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Insufficient data</p>
      )}
    </div>
  );
}

export default function ZoneSummary({ mostVisited, mostEngaged, zones, hasData }) {
  const list = zones || [];
  const activeCount = list.filter((z) => (z.visitors || 0) > 0).length;
  const totalCount = list.length || 6;
  const topShare = mostVisited ? list.find((z) => z.name === mostVisited.name)?.traffic_share ?? null : null;

  return (
    <SectionCard
      title="Zone Summary"
      subtitle="Top zones & store coverage"
      className="h-full"
      source="CCTV Tracking"
    >
      {!hasData ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 py-4 text-center">Awaiting CCTV analysis.</p>
      ) : (
        <div className="space-y-2 flex flex-col justify-between h-full">
          <MiniPanel
            icon={Trophy}
            title="MOST VISITED ZONE"
            name={mostVisited?.name}
            metric={mostVisited ? `${mostVisited.visitors} visitors ${topShare ? `(${topShare}% share)` : ''}` : null}
          />
          <MiniPanel
            icon={Flame}
            title="HIGHEST ENGAGEMENT"
            name={mostEngaged?.name}
            metric={mostEngaged ? `${mostEngaged.avg_dwell} average dwell` : null}
          />
          <MiniPanel
            icon={Compass}
            title="STORE ZONE COVERAGE"
            name={`${activeCount} of ${totalCount} Zones Active`}
            metric={totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% store area visited` : '—'}
          />
          <MiniPanel
            icon={BarChart2}
            title="TRAFFIC CONCENTRATION"
            name={topShare ? `${topShare}% in Top Zone` : 'Balanced Flow'}
            metric={mostVisited ? `Focused in ${mostVisited.name}` : 'Even distribution across zones'}
          />
        </div>
      )}
    </SectionCard>
  );
}
