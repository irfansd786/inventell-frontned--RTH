import React from "react";
import SectionCard from "../customer/SectionCard";
import { GitCommit, Info } from "lucide-react";

export default function CustomerFlowCard({ customerFlow = [], className = "" }) {
  return (
    <SectionCard
      icon={GitCommit}
      title="Customer Flow Paths"
      subtitle="Dominant sequential store navigation vectors"
      className={className}
      source="Chronological Path Reconstruction"
    >
      <div className="space-y-2.5">
        {customerFlow.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>No reliable customer flow available.</span>
          </div>
        ) : (
          customerFlow.map((flow, idx) => {
            const steps = flow.path.split(" → ");
            return (
              <div
                key={idx}
                className="p-2.5 rounded border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Primary Route #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{flow.count} visitors</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ({flow.share}%)
                    </span>
                  </div>
                </div>

                {/* Step pill visualization */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs">
                        {step}
                      </span>
                      {sIdx < steps.length - 1 && (
                        <span className="text-slate-400 text-xs font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
