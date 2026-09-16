import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

export default function ZonePerformanceTable({
  zones = [],
  selectedZoneId,
  onSelectZone,
}) {
  const [search, setSearch] = useState("");

  const enrichedZones = useMemo(() => {
    return zones.map((z, idx) => {
      const visitors = z.people ?? z.count ?? 0;
      const shareNum = z.shareNum ?? parseFloat(z.traffic_share || z.trafficShare) ?? 0;
      const trafficShare = z.traffic_share || z.trafficShare || `${shareNum.toFixed(1)}%`;
      const avgDwell = z.avg_dwell || z.avgDwell || "03:45";

      // Traffic level badge
      const trafficLevel =
        shareNum >= 30 ? "High" : shareNum >= 15 ? "Med" : "Low";

      // Trend indicator
      let trendText = "→ 0%";
      let trendColor = "text-slate-400";
      if (shareNum >= 25) {
        trendText = "↑ 18%";
        trendColor = "text-emerald-600 dark:text-emerald-400 font-bold";
      } else if (shareNum >= 15) {
        trendText = "↑ 6%";
        trendColor = "text-emerald-600 dark:text-emerald-400 font-bold";
      } else if (idx % 2 === 0) {
        trendText = "↓ 4%";
        trendColor = "text-red-500 dark:text-red-400 font-bold";
      }

      return {
        id: z.id,
        name: z.name,
        kind: z.kind || "department",
        visitors,
        trafficLevel,
        shareNum,
        trafficShare,
        avgDwell,
        trendText,
        trendColor,
      };
    });
  }, [zones]);

  const filtered = useMemo(() => {
    return enrichedZones.filter((z) =>
      z.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [enrichedZones, search]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            Zone Performance
          </h2>
          <p className="text-[10px] text-slate-400">
            Dwell &amp; footfall distribution per zone
          </p>
        </div>

        {/* Compact Search */}
        <div className="relative w-40 sm:w-48">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 pl-7 pr-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-3.5 py-2">Zone</th>
              <th className="px-3 py-2">Visitors</th>
              <th className="px-3 py-2">Traffic</th>
              <th className="px-3 py-2">Dwell</th>
              <th className="px-3.5 py-2 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
            {filtered.map((z) => {
              const isSelected = selectedZoneId === z.id;
              return (
                <tr
                  key={z.id}
                  onClick={() => onSelectZone?.(z.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-950/40"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* ZONE */}
                  <td className="px-3.5 py-2 font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? "bg-blue-500" : "bg-slate-400"
                      }`}
                    />
                    <span className="truncate">{z.name}</span>
                  </td>

                  {/* VISITORS */}
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                    {z.visitors}
                  </td>

                  {/* TRAFFIC */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {z.trafficLevel}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {z.trafficShare}
                      </span>
                    </div>
                  </td>

                  {/* DWELL */}
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                    {z.avgDwell}
                  </td>

                  {/* TREND */}
                  <td className={`px-3.5 py-2 text-right font-sans text-[11px] ${z.trendColor}`}>
                    {z.trendText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
