import React from 'react';
import Card from '../common/Card';

export default function ShelfVisual({ items }) {
  return (
    <Card title="Physical Shelf Rack Diagram" subtitle="Visual representation of retail shelf stocking levels">
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-4">
        {/* Rack Visual Outline */}
        <div className="border-2 border-slate-700 rounded-xl p-4 space-y-4 bg-slate-950/60 shadow-inner">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-1">
            Retail Aisle Rack Unit A1-B3
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex flex-col justify-between h-24 backdrop-blur-xs transition-all hover:scale-[1.02] ${
                  item.status === 'empty'
                    ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                    : item.status === 'low'
                    ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span>SHELF {item.code}</span>
                  <span>{item.row}</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-white truncate">{item.product}</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{item.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Vision AI Sensors Active</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" /> Low Stock</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" /> Empty Shelf</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
