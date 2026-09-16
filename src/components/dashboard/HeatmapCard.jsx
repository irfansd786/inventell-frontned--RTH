import React from 'react';
import Card from '../common/Card';

export default function HeatmapCard() {
  const zones = [
    { name: 'Entrance & Foyer', density: 'High', color: 'bg-red-500/80 border-red-600', text: 'High Traffic' },
    { name: 'Beverages Aisle 1', density: 'High', color: 'bg-red-500/80 border-red-600', text: 'High Traffic' },
    { name: 'Snacks Aisle 2', density: 'Medium', color: 'bg-amber-500/80 border-amber-600', text: 'Med Traffic' },
    { name: 'Personal Care', density: 'Low', color: 'bg-emerald-500/80 border-emerald-600', text: 'Low Traffic' },
    { name: 'Household Goods', density: 'Low', color: 'bg-emerald-500/80 border-emerald-600', text: 'Low Traffic' },
    { name: 'Dairy & Chillers', density: 'Medium', color: 'bg-amber-500/80 border-amber-600', text: 'Med Traffic' },
    { name: 'Checkout Counter 2', density: 'High', color: 'bg-red-500/80 border-red-600', text: 'Congestion' },
    { name: 'Checkout Counter 1', density: 'Low', color: 'bg-emerald-500/80 border-emerald-600', text: 'Normal' },
  ];

  return (
    <Card title="Store Heatmap" subtitle="Density and dwell concentration map">
      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {zones.map((z, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-white transition-all flex flex-col justify-between h-24 ${z.color} shadow-xs`}
            >
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">{z.name}</span>
              <div>
                <span className="text-xs font-extrabold bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {z.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>Traffic Concentration:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>High Traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-sm" />
              <span>Medium Traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Low Traffic</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
