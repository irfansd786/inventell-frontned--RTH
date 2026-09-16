import React from "react";
import SectionCard from "../customer/SectionCard";
import { Flame } from "lucide-react";

export default function TopTrafficAreasTable({ topZones = [], className = "" }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "High":
      case "High Heat":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "Medium":
      case "Moderate Heat":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Low":
      case "Low Heat":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <SectionCard
      icon={Flame}
      title="Top Traffic Areas"
      subtitle="Rank zones and departments by actual foot-point density"
      className={className}
      source="Zone Footpoint Aggregation"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-2 w-12">Rank</th>
              <th className="py-2 px-2">Zone</th>
              <th className="py-2 px-2 text-right">Traffic</th>
              <th className="py-2 px-3 text-right">Share</th>
              <th className="py-2 px-2 text-right w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {topZones.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No traffic points recorded in this timeframe.
                </td>
              </tr>
            ) : (
              topZones.map((tz) => {
                const shareNum = typeof tz.shareNum === "number" ? tz.shareNum : parseFloat(tz.share || tz.trafficPercent) || 0;
                return (
                  <tr key={tz.id || tz.rank} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-mono font-bold text-slate-500 dark:text-slate-400">
                      #{tz.rank}
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">
                      {tz.name}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                      {tz.traffic || `${tz.points || 0} pts`}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, shareNum)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 min-w-10">
                          {tz.share || tz.trafficPercent || `${shareNum}%`}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          tz.status
                        )}`}
                      >
                        {tz.status || "Normal"}
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
