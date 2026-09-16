import React from 'react';
import Card from '../common/Card';
import { Video, ShieldCheck, AlertCircle } from 'lucide-react';

export default function HeatmapView({
  zones = [],
  points = [],
  activeMetric = 'Customer Density',
  statusMessage = '',
  dataProvenance = 'Recorded CCTV (Testing Mode)',
  cctvConnected = true,
}) {
  return (
    <Card
      title="Store Floor Plan & Heatmap"
      subtitle={`Spatial distribution representation — Metric: ${activeMetric}`}
    >
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        {/* CCTV Session Provenance Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              <Video className="w-3 h-3" /> {dataProvenance}
            </span>
            <span className="text-slate-400">{statusMessage || 'Telemetry stream active'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> YOLOv8 Person Filter + ByteTrack Active
          </div>
        </div>

        {/* Spatial Floor Map & Zone Grid */}
        <div className="relative min-h-[300px]">
          {(zones || []).length === 0 && (
            <div className="flex flex-col items-center justify-center text-slate-400 py-16 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-xs font-semibold">No sufficient CCTV tracking data for this period.</p>
              <p className="text-[11px] text-slate-500">Process a CCTV session or select an active video camera to view spatial telemetry.</p>
            </div>
          )}

          {(zones || []).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(zones || []).map((z) => (
                <div
                  key={z.id}
                  style={{ backgroundColor: `${z.color}20`, borderColor: z.color }}
                  className="p-3.5 rounded-xl border-2 text-white flex flex-col justify-between transition-all hover:scale-[1.01] shadow-lg relative overflow-hidden group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-200 tracking-wider">
                      {z.name}
                    </span>
                    <span
                      style={{ backgroundColor: z.color }}
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-xs"
                    >
                      {z.level}
                    </span>
                  </div>

                  <div className="my-3 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-white">{z.density}%</span>
                      <span className="text-xs text-slate-300 font-mono">Dwell: {z.dwell}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${z.density}%`, backgroundColor: z.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-1.5">
                    <span>Share: {z.trafficShare}</span>
                    <span className="text-slate-300">{z.pointsCount} points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
