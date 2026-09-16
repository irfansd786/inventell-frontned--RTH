import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

const CustomQueueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-md border border-slate-700 font-mono">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        <p className="text-blue-400">Total Queue: {payload[0]?.value} people</p>
      </div>
    );
  }
  return null;
};

const CustomWaitTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-md border border-slate-700 font-mono">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        <p className="text-amber-400">Avg Wait: {payload[0]?.value} min</p>
        {payload[1] && (
          <p className="text-rose-400">Lane 03: {payload[1]?.value} min</p>
        )}
      </div>
    );
  }
  return null;
};

export default function QueueAnalyticsCharts({
  queueTrend = [],
  waitTrend = [],
  threshold = 6,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Chart 1: Queue Length Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Queue Length Trend
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total store checkout queue over observation window
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Queue Count</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500 font-bold">
              <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
              <span>Threshold ({threshold})</span>
            </div>
          </div>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          {queueTrend.length === 0 ? (
            <div className="text-center p-4">
              <TrendingUp className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Awaiting Queue Trend Telemetry
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Waiting for analysis • Requires consecutive video frames
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={queueTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                <Tooltip content={<CustomQueueTooltip />} />
                <ReferenceLine
                  y={threshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `THRESHOLD (${threshold})`,
                    fill: '#ef4444',
                    position: 'insideTopRight',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalQueue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#queueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Waiting Time Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Waiting Time Trend (Minutes)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Average vs peak lane customer wait durations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Avg Wait</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Lane 03</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed" />
              <span>SLA (4m)</span>
            </div>
          </div>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          {waitTrend.length === 0 ? (
            <div className="text-center p-4">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Awaiting Wait Time Telemetry
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Waiting for analysis • Requires customer entry and dwell duration
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={waitTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                  unit="m"
                />
                <Tooltip content={<CustomWaitTooltip />} />
                <ReferenceLine
                  y={4.0}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Line
                  type="monotone"
                  dataKey="avgWait"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="lane3Wait"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
