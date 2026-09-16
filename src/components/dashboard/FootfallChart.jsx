import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

export default function FootfallChart({ data }) {
  const { chartTheme } = useTheme();

  return (
    <Card
      title="Footfall Trend"
      subtitle="Hourly visitor count throughout the operating day"
      action={
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md shadow-2xs">
            Today
          </span>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="footfallGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTheme.emerald} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chartTheme.emerald} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.axisStroke, fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.axisStroke, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                borderColor: chartTheme.tooltipBorder,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
                fontSize: '12px',
              }}
              itemStyle={{ color: chartTheme.emerald }}
              formatter={(val) => [`${val} visitors`, 'Footfall']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={chartTheme.emerald}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#footfallGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
