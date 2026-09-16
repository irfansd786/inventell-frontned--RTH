import React from 'react';
import { Clock, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SectionCard from './SectionCard';
import { useChartTheme } from './chartTheme';
import { EmptyState } from './states';

function parseSeconds(dwellStr) {
  if (!dwellStr) return 0;
  if (typeof dwellStr === 'number') return dwellStr;
  const m = String(dwellStr).match(/(?:(\d+)m)?\s*(?:(\d+)s)?/);
  if (m) {
    const mins = parseInt(m[1] || '0', 10);
    const secs = parseInt(m[2] || '0', 10);
    return mins * 60 + secs;
  }
  return 0;
}

export default function DwellTimeAnalysis({ zones = [], summary }) {
  const chartTheme = useChartTheme();
  const storeAvgStr = summary?.average_dwell || '04m 15s';
  const storeAvgSec = parseSeconds(storeAvgStr) || 255;

  const chartData = (zones || []).map((z) => {
    const sec = parseSeconds(z.avg_dwell) || Math.round((z.traffic_share || 15) * 18);
    const isAboveAvg = sec >= storeAvgSec;
    return {
      name: z.name,
      seconds: sec,
      minutes: (sec / 60).toFixed(1),
      avgDwellStr: z.avg_dwell || `${Math.floor(sec / 60)}m ${sec % 60}s`,
      isAboveAvg,
      status: isAboveAvg ? 'High customer dwell detected' : 'Standard throughput',
    };
  });

  const aboveAvgZones = chartData.filter((d) => d.isAboveAvg);
  const belowAvgZones = chartData.filter((d) => !d.isAboveAvg);

  return (
    <SectionCard
      icon={Clock}
      title="DWELL TIME ANALYSIS"
      subtitle="Evaluation of customer dwell duration by zone compared to store average"
      className="h-full"
      source="CCTV Dwell Telemetry"
    >
      {chartData.length === 0 ? (
        <EmptyState compact message="No dwell telemetry available for selected period." />
      ) : (
        <div className="space-y-4">
          {/* Header Metric Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Overall Store Average Dwell
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {storeAvgStr}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Above Avg ({aboveAvgZones.length} zones)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Standard/Below Avg ({belowAvgZones.length} zones)
              </span>
            </div>
          </div>

          {/* Dwell Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                  unit="m"
                  tickFormatter={(val) => `${(val / 60).toFixed(0)}m`}
                />
                <Tooltip
                  contentStyle={chartTheme.tooltip}
                  formatter={(val, name, entry) => [
                    `${entry.payload.avgDwellStr} (${entry.payload.status})`,
                    'Average Dwell',
                  ]}
                />
                <ReferenceLine
                  y={storeAvgSec}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  label={{
                    value: `Store Avg (${storeAvgStr})`,
                    fill: '#3b82f6',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'top',
                  }}
                />
                <Bar dataKey="seconds" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Neutral Analytical Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                Above-Average Dwell Zones
              </span>
              <p className="text-[11px] text-emerald-950/80 dark:text-emerald-200/90 leading-relaxed">
                {aboveAvgZones.length > 0
                  ? `High customer dwell detected in ${aboveAvgZones.map((z) => z.name).join(', ')}. Represents extended interaction window.`
                  : 'All zone dwell durations are within standard baseline range.'}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                Analytical Interpretation Note
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  High dwell signifies prolonged presence; business engine evaluates whether this indicates high product engagement or checkout congestion.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
