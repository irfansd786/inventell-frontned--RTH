import React, { useState } from 'react';
import {
  Sparkles,
  Warehouse,
  Layers,
  TrendingUp,
  ArrowRight,
  Check,
  PackageCheck,
} from 'lucide-react';

const PRIORITY_THEMES = {
  CRITICAL: {
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    border: 'border-l-4 border-l-red-500',
    btn: 'bg-red-600 hover:bg-red-700 text-white',
  },
  HIGH: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    border: 'border-l-4 border-l-amber-500',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  MEDIUM: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    border: 'border-l-4 border-l-blue-500',
    btn: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white',
  },
  LOW: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border: 'border-l-4 border-l-emerald-500',
    btn: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700',
  },
};

export default function ShelfRecommendations({
  recommendations = [],
  onAction,
}) {
  const [executedIds, setExecutedIds] = useState({});

  const handleExecute = (id, rec) => {
    setExecutedIds((prev) => ({ ...prev, [id]: true }));
    onAction?.(id, rec);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Autonomous Replenishment Actions
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                SOURCE: SQL INVENTORY + SALES DEMAND
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Computer vision and inventory-driven actions connecting shelf health to warehouse stock
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {recommendations.length} Suggested Prescriptions
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <PackageCheck className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            No Critical Replenishments Needed
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Store floor inventories are currently above safety reorder thresholds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((rec) => {
            const theme = PRIORITY_THEMES[rec.priority] || PRIORITY_THEMES.LOW;
            const Icon = Warehouse;
            const isExecuted = !!executedIds[rec.id];

            return (
              <div
                key={rec.id}
                className={`p-3 rounded-md border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col justify-between ${theme.border}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${theme.badge}`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                      {rec.impact}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {rec.title}
                    </h5>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1.5">
                    Target: {rec.target}
                  </p>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isExecuted}
                    onClick={() => handleExecute(rec.id, rec)}
                    className={`w-full py-1.5 px-2.5 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm ${
                      isExecuted
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default'
                        : theme.btn
                    }`}
                  >
                    {isExecuted ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Order Dispatched</span>
                      </>
                    ) : (
                      <>
                        <span>{rec.actionLabel || 'Dispatch Restock Order'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
