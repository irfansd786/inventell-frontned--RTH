import React from "react";
import SectionCard from "./SectionCard";
import { ShieldCheck, Video, Info, Sparkles, UserCheck, ArrowRightLeft } from "lucide-react";

export default function CameraSourceCard({
  meta,
  c1Count = 1,
  c2Count = 1,
  globalOccupancy = 1,
  reidMatches = 1,
  className = "",
}) {
  const cameras = meta?.cameras || {};
  const c1 = cameras.camera_01;
  const c2 = cameras.camera_02;
  const totalObs = meta?.total_observations || 0;

  return (
    <SectionCard
      icon={Video}
      title="Camera Activity & Re-ID Coverage"
      subtitle="Dual-camera concurrent CCTV pipeline with Cross-Camera Re-ID"
      className={className}
      source="CCTV Re-ID Engine"
    >
      <div className="space-y-3">
        {/* Camera Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Camera 01 */}
          <div className="p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    c1?.connected !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Camera 01
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ● Active
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Entrance &amp; Front Store
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                <span className="text-slate-400">Detected:</span>
                <span className="font-bold text-sky-500">{c1Count} person</span>
              </div>
            </div>
          </div>

          {/* Camera 02 */}
          <div className="p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    c2?.connected !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Camera 02
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ● Active
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Aisles &amp; Checkout Area
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                <span className="text-slate-400">Detected:</span>
                <span className="font-bold text-purple-500">{c2Count} person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Camera Re-ID Deduplication Banner */}
        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Cross-Camera Person Re-ID
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white">
              DEDUPLICATED
            </span>
          </div>

          <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-slate-800 font-mono">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">CAM 01</span>
              <span className="font-bold text-sky-500">{c1Count}</span>
            </div>
            <span className="text-slate-400 font-sans">+</span>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">CAM 02</span>
              <span className="font-bold text-purple-500">{c2Count}</span>
            </div>
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">RE-ID MATCH</span>
              <span className="font-bold text-emerald-500">{reidMatches} Pair</span>
            </div>
            <span className="text-slate-400 font-sans">=</span>
            <div className="text-center bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
              <span className="text-[10px] text-blue-600 dark:text-blue-300 block font-bold">STORE OCCUPANCY</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                {globalOccupancy} PERSON
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            <strong className="text-slate-800 dark:text-slate-200">Global Deduplication Rule: </strong>
            If the same customer appears in Camera 01 and Camera 02, the multi-signal Re-ID engine
            merges them into ONE store-level person. Store count is NOT simply C1 + C2.
          </p>
        </div>

        {/* Total Observations Counter */}
        <div className="p-2 rounded border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Telemetry Observations</span>
          </div>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {totalObs.toLocaleString()} coordinates sampled
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
