import React from "react";
import SectionCard from "./SectionCard";
import { Clock, Info, Award } from "lucide-react";

export default function ZoneDwellAnalysisCard({ dwellAnalysis = [], className = "" }) {
  const highest = dwellAnalysis[0] || null;

  return (
    <SectionCard
      icon={Clock}
      title="Zone Dwell Analysis"
      subtitle="Department engagement duration & dwell spread"
      className={className}
      source="Session Duration Estimation"
    >
      <div className="space-y-2.5">
        {highest && (
          <div className="flex items-center justify-between p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-indigo-900 dark:text-indigo-200">
                  Highest Engagement Zone: {highest.zone}
                </span>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300">
                  Average dwell: {highest.avgDwell} across {highest.visits || 0} visits
                </p>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
              TOP DWELL
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-2.5">Zone</th>
                <th className="py-2 px-2.5 text-right">Avg Dwell</th>
                <th className="py-2 px-2.5 text-right">Median Dwell</th>
                <th className="py-2 px-2.5 text-right">Longest Dwell</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {dwellAnalysis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No dwell observations recorded in this window.
                  </td>
                </tr>
              ) : (
                dwellAnalysis.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {d.zone}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {d.avgDwell}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {d.medianDwell}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {d.longestDwell}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-1.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            High dwell indicates product engagement in shopping aisles, but may reflect wait times
            or congestion at checkouts. Evaluate metrics in departmental context.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}