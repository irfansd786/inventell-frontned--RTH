import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

export default function VisitorTypeChart({ data }) {
  const { chartTheme } = useTheme();

  return (
    <Card title="Visitors by Type" subtitle="Distribution of customer frequency">
      <div className="relative h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                borderColor: chartTheme.tooltipBorder,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
                fontSize: '12px',
              }}
              formatter={(val) => [`${val}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Donut Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">1,248</span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
