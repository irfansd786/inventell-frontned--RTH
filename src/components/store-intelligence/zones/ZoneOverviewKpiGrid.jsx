import React from "react";
import { Layers, Users, Flame, Clock, Shuffle } from "lucide-react";

export default function ZoneOverviewKpiGrid({ kpis }) {
  const activeZones = kpis?.activeZones;
  const occupiedZones = kpis?.occupiedZones;
  const highestTraffic = kpis?.highestTrafficZone;
  const highestDwell = kpis?.highestDwellZone;
  const transitions = kpis?.totalTransitions;

  const cards = [
    {
      label: "ACTIVE ZONES",
      value: activeZones?.value || "0 / 7 Zones",
      subtitle: activeZones?.subtitle || "Tracked store departments",
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "OCCUPIED ZONES",
      value: occupiedZones?.value || "0 Occupied",
      subtitle: occupiedZones?.subtitle || "Active shopper presence",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "HIGHEST TRAFFIC ZONE",
      value: highestTraffic?.value || "—",
      subtitle: highestTraffic?.subtitle || "Top visited zone",
      icon: Flame,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "HIGHEST DWELL ZONE",
      value: highestDwell?.value || "—",
      subtitle: highestDwell?.subtitle || "Longest engagement",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "TOTAL TRANSITIONS",
      value: typeof transitions?.value === "number" ? transitions.value.toLocaleString() : (transitions?.value || "0"),
      subtitle: transitions?.subtitle || "Inter-zone crossovers",
      icon: Shuffle,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 p-3 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider truncate">
                {c.label}
              </span>
              <span className={`p-1 rounded ${c.bg} ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                {c.value}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
