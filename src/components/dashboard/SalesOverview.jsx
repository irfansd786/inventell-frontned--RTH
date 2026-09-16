import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SalesOverview({ data }) {
  const { chartTheme } = useTheme();

  return (
    <Card title="Sales Overview" subtitle="Real-time POS revenue trajectory">
      <div className="flex items-center justify-between p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 mb-4">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Revenue Today</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">₹2,45,320</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +18.4% vs yesterday
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">320 Total Transactions</p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: chartTheme.axisStroke, fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.axisStroke, fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                borderColor: chartTheme.tooltipBorder,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
                fontSize: '12px',
              }}
              formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="sales" stroke={chartTheme.primary} strokeWidth={2.5} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
