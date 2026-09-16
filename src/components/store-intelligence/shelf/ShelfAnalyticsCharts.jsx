import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Activity, ShieldAlert, Zap } from 'lucide-react';

const ActivityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-md border border-slate-700 font-mono">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        <p className="text-cyan-400">Customer Zone Visits: {payload[0]?.value}</p>
        {payload[1] && (
          <p className="text-emerald-400">Restock Replenished: {payload[1]?.value}</p>
        )}
      </div>
    );
  }
  return null;
};

const CategoryTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-md border border-slate-700 font-mono">
        <p className="font-semibold text-slate-300 mb-1">{data.category}</p>
        <p className="text-amber-400">Stockout Risk: {data.risk}%</p>
        <p className="text-slate-400">Critical facings: {data.voids || 0}</p>
      </div>
    );
  }
  return null;
};

export default function ShelfAnalyticsCharts({
  activityData = [],
  categoryRisk = [],
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Chart 1: Customer Activity vs Restock */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Shelf Activity & Interaction Trend
                </h4>
                <span className="text-[9px] font-mono px-1 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  CCTV VISITS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customer aisle visits derived from camera tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              <span>Zone Visits</span>
            </div>
          </div>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          {activityData.length === 0 ? (
            <div className="text-center p-4">
              <Zap className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Awaiting Zone Activity Telemetry
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Waiting for analysis • Requires CCTV person zone tracking events
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="grabsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<ActivityTooltip />} />
                <Area
                  type="monotone"
                  dataKey="grabs"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#grabsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Stockout Risk by Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Stockout Risk by Category (%)
                </h4>
                <span className="text-[9px] font-mono px-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  SQL INVENTORY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculated from actual store stock & sales velocity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-rose-500">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
            <span>High Risk (&gt;25%)</span>
          </div>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          {categoryRisk.length === 0 ? (
            <div className="text-center p-4">
              <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Awaiting Inventory Risk Analytics
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Waiting for analysis • Connecting database inventory records
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryRisk}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CategoryTooltip />} />
                <ReferenceLine
                  y={25}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                  {categoryRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
