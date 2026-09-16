import React, { useMemo } from 'react';
import { Sun, Sunset, Moon, Sunrise, TrendingUp } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function PeakCustomerPeriods({ traffic = [], peakPeriod }) {
  const periodBreakdown = useMemo(() => {
    let morning = 0; // 08:00 - 12:00
    let afternoon = 0; // 12:00 - 16:00
    let evening = 0; // 16:00 - 20:00
    let night = 0; // 20:00 - 23:00

    (traffic || []).forEach((item) => {
      const label = item.label || '';
      const hour = parseInt(label.split(':')[0], 10);
      const v = item.visitors || item.entries || 0;

      if (!isNaN(hour)) {
        if (hour >= 8 && hour < 12) morning += v;
        else if (hour >= 12 && hour < 16) afternoon += v;
        else if (hour >= 16 && hour < 20) evening += v;
        else if (hour >= 20 || hour < 8) night += v;
      } else {
        evening += v;
      }
    });

    const total = morning + afternoon + evening + night || 1;

    return [
      {
        id: 'morning',
        name: 'Morning Period',
        range: '08:00 – 12:00',
        count: morning,
        share: Math.round((morning / total) * 100),
        icon: Sunrise,
      },
      {
        id: 'afternoon',
        name: 'Afternoon Period',
        range: '12:00 – 16:00',
        count: afternoon,
        share: Math.round((afternoon / total) * 100),
        icon: Sun,
      },
      {
        id: 'evening',
        name: 'Evening Peak',
        range: '16:00 – 20:00',
        count: evening,
        share: Math.round((evening / total) * 100),
        icon: Sunset,
      },
      {
        id: 'night',
        name: 'Night Period',
        range: '20:00 – 23:00',
        count: night,
        share: Math.round((night / total) * 100),
        icon: Moon,
      },
    ];
  }, [traffic]);

  const sortedPeriods = [...periodBreakdown].sort((a, b) => b.count - a.count);
  const highestPeriod = sortedPeriods[0];
  const lowestPeriod = sortedPeriods[sortedPeriods.length - 1];

  return (
    <SectionCard
      icon={TrendingUp}
      title="PEAK CUSTOMER PERIODS"
      subtitle="Customer traffic distribution across operational time windows"
      className="h-full"
      source="Hourly CCTV Aggregations"
    >
      {traffic.length === 0 ? (
        <EmptyState compact message="No traffic activity recorded for peak period calculation." />
      ) : (
        <div className="space-y-4">
          {/* Time Window Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {periodBreakdown.map((p) => {
              const Icon = p.icon;
              const isHighest = p.id === highestPeriod.id;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                    isHighest
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.range}
                    </span>
                    <span
                      className={`p-1 rounded ${
                        isHighest ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono leading-none">
                      {p.count}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                      {p.share}% of daily traffic
                    </span>
                  </div>

                  {isHighest && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white w-max">
                      Peak Window
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Business Insights Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px]">
              Data-Derived Traffic Pattern Observation
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Customer traffic peaks during the <strong className="text-blue-600 dark:text-blue-400">{highestPeriod.name} ({highestPeriod.range})</strong> with {highestPeriod.share}% of total daily visitors. Lowest footfall occurs during the <strong className="text-slate-700 dark:text-slate-300">{lowestPeriod.name} ({lowestPeriod.range})</strong>.
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
