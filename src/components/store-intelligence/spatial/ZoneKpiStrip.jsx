import React from "react";

export default function ZoneKpiStrip({
  uniqueVisitors = 1284,
  peakZone = { name: "Snacks & Food", share: "29.1%" },
  avgDwell = "04:32",
  trafficDensity = "29.1%",
  activeCameras = 2,
  totalCameras = 2,
  reidActive = true,
}) {
  const visitorsFormatted =
    typeof uniqueVisitors === "number"
      ? uniqueVisitors.toLocaleString()
      : uniqueVisitors;

  const peakZoneName =
    typeof peakZone === "object" ? peakZone.name || "Snacks & Food" : peakZone;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        {/* 1. UNIQUE VISITORS */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {visitorsFormatted}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              +12.4%
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Unique Visitors
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            Re-ID Deduplicated
          </span>
        </div>

        {/* 2. PEAK ZONE */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
              {peakZoneName}
            </span>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded shrink-0">
              HIGH
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Peak Zone
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            {peakZone?.share || "29.1%"} floor share
          </span>
        </div>

        {/* 3. AVG DWELL */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {avgDwell}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
              +18s
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Avg Dwell
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            Store baseline: 03:30
          </span>
        </div>

        {/* 4. TRAFFIC DENSITY */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {trafficDensity}
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
              OPTIMAL
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Traffic
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            Floor concentration
          </span>
        </div>

        {/* 5. CAMERAS */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center col-span-2 sm:col-span-1">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {activeCameras} / {totalCameras}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ACTIVE
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Cameras
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            {reidActive ? "Re-ID Synchronized" : "Standalone"}
          </span>
        </div>
      </div>
    </div>
  );
}
