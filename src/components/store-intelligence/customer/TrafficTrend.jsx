// Customer Traffic Trend — primary analytics chart.
// Real per-bin session starts (Visitors) and session ends (Exits) with a
// peak-traffic marker. Hourly/Daily/Weekly control actually refetches.

import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts';
import SectionCard from './SectionCard';
import { useChartTheme } from './chartTheme';
import { EmptyState } from './states';

const GRANULARITIES = ['hourly', 'daily', 'weekly'];

function LegendDot({ color }) {
  return <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: color }} />;
}

function CustomTrafficTooltip({ active, payload, label, chart }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={chart.tooltip}
      className="p-2.5 rounded-md border text-xs shadow-md space-y-1.5 min-w-[140px]"
    >
      <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-800 dark:text-slate-100">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrafficTrend({ traffic, peakPeriod, granularity, onGranularity }) {
  const chart = useChartTheme();
  const hasTraffic = (traffic || []).length > 0;
  const peakLabel = peakPeriod?.label;

  return (
    <SectionCard
      icon={TrendingUp}
      title="Customer Traffic Trend"
      subtitle="Visitors, entries and exits over time"
      className="h-full"
      source="CCTV Tracking · Camera 01 + Camera 02"
      action={(
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60" role="tablist" aria-label="Traffic granularity">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={granularity === g}
              onClick={() => onGranularity(g)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize transition-all ${
                granularity === g
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    >
      {!hasTraffic ? (
        <EmptyState message="No customer tracking data available for the selected period." />
      ) : (
        <>
          <div className="flex items-center gap-4 px-1 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center"><LegendDot color="#2563EB" />Visitors</span>
            <span className="inline-flex items-center"><LegendDot color="#059669" />Entries</span>
            <span className="inline-flex items-center"><LegendDot color="#D97706" />Exits</span>
          </div>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={traffic} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="caTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chart.tick, fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip content={<CustomTrafficTooltip chart={chart} />} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#caTrafficGrad)"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#2563EB', strokeWidth: 2, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  name="Entries"
                  stroke="#059669"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3.5, stroke: '#059669', strokeWidth: 1.5, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="exits"
                  name="Exits"
                  stroke="#D97706"
                  strokeWidth={1.75}
                  dot={false}
                  activeDot={{ r: 3.5, stroke: '#D97706', strokeWidth: 1.5, fill: '#fff' }}
                />
                {peakLabel && (
                  <ReferenceDot
                    x={peakLabel}
                    y={peakPeriod.visitors}
                    r={4.5}
                    fill="#2563EB"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={{
                      value: `Peak: ${peakPeriod.visitors}`,
                      position: 'top',
                      fontSize: 10,
                      fontWeight: 700,
                      fill: chart.tick,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </SectionCard>
  );
}
