import React from "react";
import SectionCard from "./SectionCard";
import { Compass, Flame, Layers, Users } from "lucide-react";

export default function SpatialSummaryCard({
  zones = [],
  topZones = [],
  kpis,
  metric = "Traffic Density",
  className = "",
}) {
  const activeZoneCount = zones.filter((z) => (z.people || 0) > 0).length;
  const topZone = topZones[0] || null;

  return (
    <SectionCard
      icon={Compass}
      title="Zone Summary"
      subtitle={`Floor distribution & coverage · Mode: ${metric}`}
      className={className}
      source="CCTV Footpoint Telemetry"
    >
      <div className="grid grid-cols-2 gap-2.5 h-full content-between">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            FLOOR ZONE COVERAGE
          </span>
          <p className="text-base font-black text-slate-900 dark:text-white mt-1">
            {activeZoneCount} / {zones.length || 7} Active Zones
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
            {zones.length ? `${Math.round((activeZoneCount / zones.length) * 100)}% active footprint` : "—"}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            TOP HOTSPOT FOCUS
          </span>
          <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-1 truncate">
            {topZone?.name || "—"}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
            {topZone ? `${topZone.share} (${topZone.traffic})` : "Awaiting data"}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            PEAK DENSITY SHARE
          </span>
          <p className="text-base font-black text-red-600 dark:text-red-400 mt-1">
            {kpis?.peakDensity?.value || "0%"}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
            Max spatial concentration
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            SAMPLING EFFICIENCY
          </span>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {kpis?.avgDwell?.value || "0m 00s"}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
            Real-time tracking fidelity
          </span>
        </div>
      </div>
    </SectionCard>
  );
}