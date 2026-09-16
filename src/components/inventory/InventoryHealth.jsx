import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

export default function InventoryHealth({ data = [], totalCount }) {
  const safeData = Array.isArray(data) ? data : [];
  const calculatedTotal = totalCount !== undefined
    ? totalCount
    : safeData.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <Card
      title="Stock Availability Distribution"
      subtitle={`Availability status across ${calculatedTotal} products in current view`}
    >
      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={false}
            >
              {safeData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
            {calculatedTotal}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
            Products
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {safeData.map((b, idx) => {
          const pct = calculatedTotal > 0 ? ((b.value / calculatedTotal) * 100).toFixed(0) : 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">
                  {b.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-[11px] ml-1 shrink-0 font-mono">
                {b.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
