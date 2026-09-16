import React from 'react';

export default function HeatmapLegend() {
  const levels = [
    { label: 'Low Traffic (0-30%)', color: '#6EE7B7' },
    { label: 'Medium Traffic (30-60%)', color: '#10B981' },
    { label: 'High Traffic (60-80%)', color: '#F59E0B' },
    { label: 'Very High / Bottleneck (80-100%)', color: '#DC2626' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-xs">
      <span className="font-bold text-white uppercase text-[11px] tracking-wider">Heatmap Density Key:</span>
      <div className="flex flex-wrap items-center gap-4">
        {levels.map((lvl, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: lvl.color }} />
            <span className="font-medium text-slate-300">{lvl.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
