import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BellRing,
  Check,
} from 'lucide-react';

export default function QueueAlertsBanner({
  activeAlert,
  queueStatus = 'NORMAL',
  currentQueue = 0,
  threshold = 6,
  queueGrowth = 'Stable',
  averageWaitTime = '00:00',
  recommendation = 'No action required',
  recommendationReason = 'Queue flow is nominal.',
  durationMinutes = 4,
  onReviewAlert,
  onOpenCounter,
}) {
  const isHigh = queueStatus === 'HIGH' || queueStatus === 'CRITICAL' || !!activeAlert;
  const isCritical = queueStatus === 'CRITICAL' || activeAlert?.severity === 'CRITICAL';
  const isModerate = queueStatus === 'MODERATE';

  const alertSeverityLabel = isCritical ? 'CRITICAL QUEUE' : isHigh ? 'HIGH QUEUE' : isModerate ? 'MODERATE QUEUE' : 'NORMAL QUEUE';
  const queueCount = activeAlert?.queue_length ?? currentQueue;
  const currentThreshold = activeAlert?.threshold ?? threshold;
  const activeRec = activeAlert?.recommendation || recommendation;
  const activeReason = activeAlert?.reason || recommendationReason;
  const activeDuration = activeAlert?.duration_minutes ?? durationMinutes ?? 4;

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1 rounded-md ${
              isHigh
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : isModerate
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Queue Alerts & AI Recommendations
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live operational threshold monitoring and real-time cashier allocation advice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Threshold: {currentThreshold} Persons
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              isCritical
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 animate-pulse'
                : isHigh
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                : isModerate
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isHigh ? 'Active Alert' : isModerate ? 'Attention' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* Main Alert Card */}
      {isHigh ? (
        <div className="p-4 sm:p-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-gradient-to-r from-red-50/90 via-red-50/40 to-slate-50 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            {/* LEFT: Alert Status & People Waiting */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white tracking-wide uppercase shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  🔴 {alertSeverityLabel}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Queue increasing for {activeDuration} minutes
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 tracking-tight leading-none">
                  {queueCount} PEOPLE WAITING
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  (Configured Threshold: {currentThreshold})
                </span>
              </div>

              {/* AI Recommendation Box */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-red-800 dark:text-red-300 font-bold text-xs uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>AI Recommendation:</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeRec}
                </p>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Reason: </span>
                  {activeReason}
                </div>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex sm:flex-col lg:flex-row items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={onReviewAlert}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition shadow-sm cursor-pointer"
              >
                <span>Review Alert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenCounter}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <span>Open Counter</span>
              </button>
            </div>
          </div>
        </div>
      ) : isModerate ? (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white uppercase">
                🟡 MODERATE QUEUE
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {queueCount} People Waiting
              </span>
              <span className="text-[11px] text-slate-500">
                (Threshold: {currentThreshold})
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-amber-800 dark:text-amber-300">AI Recommendation: </span>
              {activeRec} — {activeReason}
            </p>
          </div>

          <button
            type="button"
            onClick={onReviewAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60 transition shrink-0"
          >
            <span>Review Alert</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/15 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  🟢 NORMAL QUEUE — {queueCount} Persons Waiting
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Threshold: {currentThreshold}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                AI Recommendation: {activeRec} • Checkout flow operating smoothly within acceptable SLA limits.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40">
            SLA Compliant
          </span>
        </div>
      )}
    </div>
  );
}