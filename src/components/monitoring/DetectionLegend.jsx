import React from 'react';
import Card from '../common/Card';

export default function DetectionLegend() {
  const legendItems = [
    { label: 'Same Person in Both Cams (Counted as 1)', color: 'border-2 border-purple-400 bg-purple-500/20', text: 'Purple Box' },
    { label: 'Single Camera Person', color: 'border-2 border-emerald-400 bg-emerald-500/10', text: 'Green Box' },
    { label: 'Entry / Exit Zone', color: 'border-b-2 border-emerald-500 bg-emerald-500/10', text: 'Green Line' },
    { label: 'Queue / Congestion', color: 'border-2 border-rose-500 bg-rose-500/10', text: 'Red Zone' },
  ];


  return (
    <Card title="Detection Overlay Legend" subtitle="Visual key for CCTV annotations">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {legendItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between h-20 text-white"
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-xs ${item.color}`} />
              <span className="text-[11px] font-mono text-slate-300 font-bold">{item.text}</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
