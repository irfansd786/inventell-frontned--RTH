import React, { useState, useMemo } from "react";
import SectionCard from "./SectionCard";
import { Table, Search, ArrowUpDown, Filter } from "lucide-react";

export default function EnterpriseZoneTable({
  zones = [],
  selectedZoneId,
  onSelectZone,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const getIntensityBadge = (shareNum) => {
    if (shareNum >= 30) {
      return {
        label: "Peak",
        cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
        dot: "bg-red-500",
      };
    }
    if (shareNum >= 20) {
      return {
        label: "High",
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dot: "bg-amber-500",
      };
    }
    if (shareNum >= 10) {
      return {
        label: "Medium",
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dot: "bg-amber-500",
      };
    }
    return {
      label: "Low",
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-500",
    };
  };

  const getFlowContribution = (zone) => {
    const kind = (zone.kind || "").toLowerCase();
    const id = (zone.id || "").toLowerCase();
    const status = (zone.status || "").toLowerCase();

    if (id.includes("checkout") || kind === "checkout") {
      return {
        label: "Checkout Flow Dest (35%)",
        cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    }
    if (kind === "entry") {
      return {
        label: "Store Entry Point (100%)",
        cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    }
    if (status === "high" || status === "crowded" || status === "bottleneck") {
      return {
        label: "High Dwell / Bottleneck",
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    }
    if (zone.visits > 50 || parseFloat(zone.traffic_share) > 15) {
      return {
        label: "Primary Transit Corridor",
        cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      };
    }
    return {
      label: "Secondary Browsing",
      cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Critical":
      case "Bottleneck":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "High":
      case "Crowded":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Normal":
      case "Optimal":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Empty":
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const matchSearch =
        search === "" ||
        z.name?.toLowerCase().includes(search.toLowerCase()) ||
        z.kind?.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        filterCategory === "all" ||
        z.kind?.toLowerCase() === filterCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [zones, search, filterCategory]);

  return (
    <SectionCard
      icon={Table}
      title="Zone Performance Breakdown"
      subtitle="Comprehensive metrics across all store departments · Click any row to highlight zone on map"
      className={className}
      source="CCTV Spatial Analytics"
      action={
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search zones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 w-32 sm:w-44"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="entry">Entry / Exit</option>
            <option value="department">Departments</option>
            <option value="aisle">Aisles</option>
            <option value="checkout">Checkout</option>
          </select>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
              <th className="py-2.5 px-3">Zone Name</th>
              <th className="py-2.5 px-3">Category / Type</th>
              <th className="py-2.5 px-3 text-right">Live People</th>
              <th className="py-2.5 px-3 text-right">Total Footfall</th>
              <th className="py-2.5 px-3 text-right">Avg Dwell</th>
              <th className="py-2.5 px-3 text-center">Traffic Intensity</th>
              <th className="py-2.5 px-3 text-right">Traffic Share</th>
              <th className="py-2.5 px-3 text-right">Flow Contribution / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredZones.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No zones match the current filter.
                </td>
              </tr>
            ) : (
              filteredZones.map((z) => {
                const isSelected = selectedZoneId === z.id;
                const shareNum =
                  typeof z.traffic_share_num === "number"
                    ? z.traffic_share_num
                    : parseFloat(z.traffic_share) || 0;
                const intensityBadge = getIntensityBadge(shareNum);
                const flowContrib = getFlowContribution(z);

                return (
                  <tr
                    key={z.id}
                    onClick={() => onSelectZone?.(z.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 font-medium border-l-2 border-l-blue-600"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Zone Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected
                              ? "bg-blue-600 ring-2 ring-blue-300"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {z.name}
                        </span>
                      </div>
                    </td>

                    {/* Category / Type */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {z.kind || "department"}
                      </span>
                    </td>

                    {/* Live People */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {z.people ?? z.count ?? 0}
                    </td>

                    {/* Total Footfall */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {z.visits ? z.visits.toLocaleString() : z.points ? z.points.toLocaleString() : 0}
                    </td>

                    {/* Avg Dwell */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {z.avg_dwell || z.avgDwell || "0m 00s"}
                    </td>

                    {/* Traffic Intensity */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${intensityBadge.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${intensityBadge.dot}`} />
                        {intensityBadge.label}
                      </span>
                    </td>

                    {/* Traffic Share */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, shareNum)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 min-w-10">
                          {z.traffic_share || z.trafficShare || `${shareNum}%`}
                        </span>
                      </div>
                    </td>

                    {/* Flow Contribution / Status */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${flowContrib.cls}`}
                        >
                          {flowContrib.label}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            z.status
                          )}`}
                        >
                          {z.status || "Normal"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}