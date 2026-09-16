import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Warehouse,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';

export default function AiShelfInsight({
  insight = {
    title: 'Awaiting Shelf Telemetry',
    description:
      'Waiting for analysis — AI operational insights will generate automatically from store inventory and demand velocity.',
    severity: 'LOW',
    timestamp: 'Awaiting data',
    recommendationText: '',
    dataSource: 'INVENTORY DATA',
  },
  onDispatchRunner,
}) {
  const [dispatched, setDispatched] = useState(false);
  const currentInsight = insight || {
    title: 'Awaiting Shelf Telemetry',
    description: 'Waiting for analysis — AI operational insights will generate automatically.',
    severity: 'LOW',
    timestamp: 'Awaiting data',
    recommendationText: '',
    dataSource: 'INVENTORY DATA',
  };

  const isHigh = currentInsight.severity === 'HIGH' || currentInsight.severity === 'CRITICAL';

  const handleDispatch = () => {
    setDispatched(true);
    onDispatchRunner?.();
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg p-3.5 shadow-sm relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Operational AI Shelf Insight
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  isHigh
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {currentInsight.severity} SEVERITY
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {currentInsight.timestamp}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                SOURCE: {currentInsight.dataSource || 'INVENTORY DATA'}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {currentInsight.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {currentInsight.description}
            </p>

            {currentInsight.recommendationText && (
              <div className="mt-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{currentInsight.recommendationText}</span>
              </div>
            )}
          </div>
        </div>

        {currentInsight.recommendationText && (
          <div className="shrink-0 self-end sm:self-center">
            <button
              type="button"
              disabled={dispatched}
              onClick={handleDispatch}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition ${
                dispatched
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
            >
              {dispatched ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Runner Dispatched</span>
                </>
              ) : (
                <>
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>Dispatch Warehouse Runner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
