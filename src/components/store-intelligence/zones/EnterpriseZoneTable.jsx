import React from "react";
import SectionCard from "../customer/SectionCard";
import { Table } from "lucide-react";

export default function EnterpriseZoneTable({
  zones = [],
  selectedZoneId,
  onSelectZone,
  className = "",
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Normal":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Empty":
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <SectionCard
      icon={Table}
      title="Store Zones Telemetry"
      subtitle="Complete department tracking metrics · Click any row to inspect zone"
      className={className}
      source="Real CCTV Zone Engine"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3 text-right">People</th>
              <th className="py-2.5 px-3 text-right">Visits</th>
              <th className="py-2.5 px-3 text-right">Avg Dwell</th>
              <th className="py-2.5 px-3 text-right">Traffic Share</th>
              <th className="py-2.5 px-3 text-right">Occupancy</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {zones.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                  No zone telemetry available.
                </td>
              </tr>
            ) : (
              zones.map((z) => {
                const isSelected = selectedZoneId === z.id;
                const shareNum = typeof z.traffic_share_num === "number" ? z.traffic_share_num : parseFloat(z.traffic_share) || 0;
                return (
                  <tr
                    key={z.id}
                    onClick={() => onSelectZone?.(z.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/30 font-medium"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-blue-600 ring-2 ring-blue-300" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">{z.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({z.kind})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {z.people}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {z.visits || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {z.avg_dwell || "0m 00s"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, shareNum)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 min-w-10">
                          {z.traffic_share || `${shareNum}%`}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {z.occupancy || `${z.occupancy_pct || 0}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          z.status
                        )}`}
                      >
                        ● {z.status}
                      </span>
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
