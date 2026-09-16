import React from "react";
import { GitCommit } from "lucide-react";

export default function ZoneCustomerFlow({ customerFlow = [], className = "" }) {
  const flows =
    customerFlow.length > 0
      ? customerFlow
      : [
          {
            path: "ENTRY → SNACKS & FOOD → AISLE → CHECKOUT",
            count: 142,
            share: 45,
          },
          {
            path: "GROCERY → AISLE → CHECKOUT",
            count: 88,
            share: 28,
          },
          {
            path: "SNACKS & FOOD → PERSONAL CARE → CHECKOUT",
            count: 64,
            share: 20,
          },
          {
            path: "ENTRY → PROMOTIONAL DISPLAY → CHECKOUT",
            count: 42,
            share: 13,
          },
        ];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden h-full ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-blue-500" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Customer Flow
            </h2>
          </div>
          <p className="text-[10px] text-slate-400">
            Dominant sequential customer routes
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
          Markov Analysis
        </span>
      </div>

      {/* Flow Sequences List */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between overflow-y-auto">
        {flows.slice(0, 4).map((flow, idx) => {
          const steps = flow.path.split(" → ");
          return (
            <div
              key={idx}
              className="p-2 rounded-md border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Route #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    {flow.count} shoppers
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ({flow.share}%)
                  </span>
                </div>
              </div>

              {/* Step Sequence Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                      {step}
                    </span>
                    {sIdx < steps.length - 1 && (
                      <span className="text-slate-400 text-xs font-bold">
                        →
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3.5 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span>Route confidence: 94.2%</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          Re-ID Linked
        </span>
      </div>
    </div>
  );
}
