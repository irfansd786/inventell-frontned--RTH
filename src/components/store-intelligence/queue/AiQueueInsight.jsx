import React from 'react';
import { Sparkles, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AiQueueInsight({
  insight = {
    title: 'Awaiting Queue Telemetry',
    description:
      'Waiting for analysis — AI operational insights will generate automatically from CCTV wait times and lane congestion.',
    severity: 'LOW',
    timestamp: 'Awaiting stream',
    recommendationText: '',
    dataSource: 'CCTV ANALYSIS',
  },
  onExecuteRecommendation,
}) {
  const currentInsight = insight || {
    title: 'Awaiting Queue Telemetry',
    description: 'Waiting for analysis — AI operational insights will generate automatically.',
    severity: 'LOW',
    timestamp: 'Awaiting stream',
    recommendationText: '',
    dataSource: 'CCTV ANALYSIS',
  };

  const isHigh = currentInsight.severity === 'HIGH' || currentInsight.severity === 'CRITICAL';

  return (
    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/60 rounded-lg p-3.5 shadow-sm relative overflow-hidden">
      {/* Decorative accent background pill */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-600 dark:bg-blue-500 text-white shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Operational AI Insight
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  isHigh
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                SOURCE: {currentInsight.dataSource || 'CCTV ANALYSIS'}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {currentInsight.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {currentInsight.description}
            </p>

            {currentInsight.recommendationText && (
              <div className="mt-2 text-[11px] font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{currentInsight.recommendationText}</span>
              </div>
            )}
          </div>
        </div>

        {currentInsight.recommendationText && (
          <div className="shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={onExecuteRecommendation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium shadow-sm transition"
            >
              <span>Execute Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
