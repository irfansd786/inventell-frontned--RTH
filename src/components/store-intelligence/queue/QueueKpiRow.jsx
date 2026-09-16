import React from "react";
import { Users, Clock, TrendingUp, ShieldAlert, Sliders, CheckCircle2 } from "lucide-react";

export default function QueueKpiRow({ metrics = {}, ...props }) {
  const currentQueue = metrics.currentQueue ?? props.currentQueue ?? 0;
  const averageWait = metrics.averageWaitTime || metrics.avgWaitTime || props.averageWait || "00:00";
  const peakQueue = metrics.peakQueue ?? props.peakQueue ?? 0;
  const activeLanes = metrics.activeCheckoutLanes ?? metrics.activeLanes ?? props.activeLanes ?? 0;
  const totalLanes = metrics.totalCheckoutLanes ?? props.totalLanes ?? 4;
  const queueStatus = (metrics.queueStatus || metrics.queueRisk || props.queueRisk || "NORMAL").toUpperCase();
  const queueGrowth = metrics.queueGrowthDisplay || metrics.queueGrowth || "Stable";
  const threshold = metrics.queueThreshold ?? metrics.threshold ?? 6;
  const peakTime = metrics.peakTime || "Session";
  const alertStatus = metrics.alertStatus || (queueStatus === "NORMAL" ? "NORMAL" : `${queueStatus} ALERT`);

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "CRITICAL") {
      return {
        badge: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-500/30",
        label: "CRITICAL",
        dot: "bg-red-600 animate-ping",
        textColor: "text-red-600 dark:text-red-400",
      };
    }
    if (s === "HIGH") {
      return {
        badge: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-500/20",
        label: "HIGH ALERT",
        dot: "bg-red-500",
        textColor: "text-red-600 dark:text-red-400",
      };
    }
    if (s === "MEDIUM" || s === "MODERATE") {
      return {
        badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        label: "MODERATE",
        dot: "bg-amber-500",
        textColor: "text-amber-600 dark:text-amber-400",
      };
    }
    return {
      badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      label: "NORMAL",
      dot: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    };
  };

  const statusStyle = getStatusBadge(queueStatus);
  const formattedQueue = String(currentQueue).padStart(2, "0");
  const formattedPeak = String(peakQueue).padStart(2, "0");
  const formattedLanes = String(activeLanes).padStart(2, "0");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        {/* 1. CURRENT QUEUE LENGTH */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {formattedQueue}{" "}
              <span className="text-xs sm:text-sm font-semibold text-slate-500 font-sans">
                people
              </span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
              CCTV Feed
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Current Queue
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Threshold: {threshold} people
          </span>
        </div>

        {/* 2. AVERAGE WAIT TIME */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-mono">
              {averageWait}
            </span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              mm:ss
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Average Wait Time
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Derived from CCTV dwell
          </span>
        </div>

        {/* 3. PEAK QUEUE */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {formattedPeak}{" "}
              <span className="text-xs sm:text-sm font-semibold text-slate-500 font-sans">
                people
              </span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              {peakTime !== "Session" ? `${peakTime}` : "Session"}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Peak Queue
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Max observed in session
          </span>
        </div>

        {/* 4. QUEUE GROWTH & ACTIVE LANES */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
              {queueGrowth}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded shrink-0">
              {formattedLanes}/{totalLanes} Lanes
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Queue Growth
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Velocity over time window
          </span>
        </div>

        {/* 5. QUEUE STATUS */}
        <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center col-span-2 sm:col-span-1">
          <div className="flex items-baseline justify-between gap-1">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${statusStyle.textColor}`}
            >
              {queueStatus}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${statusStyle.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {statusStyle.label}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Queue Status
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {metrics.riskSubtext || "Real-time CV threshold check"}
          </span>
        </div>
      </div>
    </div>
  );
}