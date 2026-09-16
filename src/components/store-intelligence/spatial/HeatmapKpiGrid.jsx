import React from "react";
import { Activity, Flame, Award, Users, Video, Sparkles } from "lucide-react";

export default function HeatmapKpiGrid({
  kpis,
  totalVisitors,
  peakZone,
  avgDwellTime,
  trafficIntensity,
  activeCamerasCount = 2,
  reidActive = true,
}) {
  // Extract values with flexible fallbacks to whatever service data is provided
  const visitorsVal =
    totalVisitors != null
      ? totalVisitors
      : kpis?.totalVisitors?.value != null
      ? kpis.totalVisitors.value
      : kpis?.activeSessions?.value != null
      ? kpis.activeSessions.value
      : kpis?.trackedPeople?.value != null
      ? kpis.trackedPeople.value
      : 1;

  const peakZoneVal =
    peakZone?.name ||
    kpis?.highestTrafficZone?.value ||
    kpis?.peakZone?.value ||
    "Produce Section";

  const peakZoneSub =
    peakZone?.share ||
    kpis?.highestTrafficZone?.subtitle ||
    kpis?.peakFloorDensity?.value ||
    "Highest traffic concentration";

  const dwellVal =
    avgDwellTime ||
    kpis?.avgDwell?.value ||
    kpis?.avgDwellTime?.value ||
    "2m 15s";

  const dwellSub =
    kpis?.avgDwell?.subtitle ||
    "Avg customer dwell across store";

  const intensityVal =
    trafficIntensity ||
    kpis?.peakFloorDensity?.value ||
    kpis?.peakDensity?.value ||
    "High Heat";

  const intensitySub =
    kpis?.avgFloorDensity?.value
      ? `${kpis.avgFloorDensity.value} avg density`
      : "Active hotspots mapped";

  const cards = [
    {
      label: "TOTAL STORE VISITORS",
      value: typeof visitorsVal === "number" ? visitorsVal.toLocaleString() : visitorsVal,
      subtitle: reidActive ? "Cross-Camera Re-ID Deduplicated" : "Store occupancy",
      badge: reidActive ? "Re-ID Active" : "Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "PEAK TRAFFIC ZONE",
      value: peakZoneVal,
      subtitle: peakZoneSub,
      badge: "Top Area",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "AVG STORE DWELL TIME",
      value: dwellVal,
      subtitle: dwellSub,
      badge: "Session Avg",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      icon: Activity,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "TRAFFIC INTENSITY",
      value: intensityVal,
      subtitle: intensitySub,
      badge: "Hotspots",
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      icon: Flame,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      label: "ACTIVE CAMERAS",
      value: `${activeCamerasCount} / 2 Connected`,
      subtitle: reidActive ? "Dual-Camera Matching Synced" : "Concurrent feeds",
      badge: "Re-ID Synced",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: Video,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider truncate uppercase">
                {c.label}
              </span>
              <span className={`p-1 rounded ${c.bg} ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  {c.value}
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 mt-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {c.subtitle}
                </p>
                {c.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${c.badgeColor}`}
                  >
                    {c.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}