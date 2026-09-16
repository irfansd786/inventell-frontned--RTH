import React from "react";
import SectionCard from "./SectionCard";
import { ArrowRight, Shuffle } from "lucide-react";

export default function ZoneTransitionsCard({ transitions = [], className = "" }) {
  return (
    <SectionCard
      icon={Shuffle}
      title="Zone Transitions"
      subtitle="Inter-department movement crossovers (FROM → TO)"
      className={className}
      source="Sequential Tracking Vectors"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-2.5">From</th>
              <th className="py-2 px-1 text-center w-6"></th>
              <th className="py-2 px-2.5">To</th>
              <th className="py-2 px-2.5 text-right">Customers</th>
              <th className="py-2 px-2.5 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transitions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No inter-zone transitions recorded yet.
                </td>
              </tr>
            ) : (
              transitions.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {t.from_name}
                  </td>
                  <td className="py-2 px-1 text-center text-slate-400">
                    <ArrowRight className="w-3 h-3 inline" />
                  </td>
                  <td className="py-2 px-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {t.to_name}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                    {t.customers}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {t.share}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}