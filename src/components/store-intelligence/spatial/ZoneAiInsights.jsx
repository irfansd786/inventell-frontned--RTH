import React from "react";
import { Sparkles, Video } from "lucide-react";

export default function ZoneAiInsights({
  insights = [],
  uniqueVisitors = 1284,
  activeCameras = 2,
  reidActive = true,
  className = "",
}) {
  // Built-in intelligent high-value observations matching exact prompt specification
  const defaultInsights = [
    {
      category: "HIGH TRAFFIC",
      severity: "critical",
      title: "Snacks & Food",
      description: "29.1% of observed traffic. Primary customer concentration zone on retail floor.",
    },
    {
      category: "FLOW OBSERVATION",
      severity: "info",
      title: "Most Common Route",
      description: "Snacks & Food → Aisle → Checkout (45% of completed shopper navigation paths).",
    },
    {
      category: "DWELL ANALYSIS",
      severity: "warning",
      title: "Personal Care",
      description: "Avg dwell: 04:32. 32% longer dwell than store baseline (03:30) with slower conversion.",
    },
    {
      category: "RECOMMENDATION",
      severity: "purple",
      title: "Floor Optimization",
      description: "High-density activity detected near Snacks & Food. Reallocate staff to aisle assistance.",
    },
  ];

  const list =
    insights.length > 0
      ? insights.slice(0, 4).map((ins, idx) => {
          const text =
            typeof ins === "string" ? ins : ins.description || ins.title;
          const lower = text.toLowerCase();
          const isHigh = lower.includes("traffic") || lower.includes("dense") || lower.includes("crowd");
          const isDwell = lower.includes("dwell") || lower.includes("bottleneck") || lower.includes("wait");
          const isRec = lower.includes("reposition") || lower.includes("recommend") || lower.includes("consider");

          return {
            category: isHigh
              ? "HIGH TRAFFIC"
              : isDwell
              ? "DWELL ANALYSIS"
              : isRec
              ? "RECOMMENDATION"
              : "FLOW OBSERVATION",
            severity: isHigh ? "critical" : isDwell ? "warning" : isRec ? "purple" : "info",
            title:
              typeof ins === "object" && ins.title
                ? ins.title
                : isHigh
                ? "Snacks & Food"
                : isDwell
                ? "Personal Care"
                : isRec
                ? "Floor Optimization"
                : "Dominant In-Store Route",
            description: text,
          };
        })
      : defaultInsights;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "critical":
        return {
          dot: "bg-red-500",
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-500/10",
        };
      case "warning":
        return {
          dot: "bg-amber-500",
          text: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-500/10",
        };
      case "purple":
        return {
          dot: "bg-indigo-500",
          text: "text-indigo-600 dark:text-indigo-400",
          bg: "bg-indigo-500/10",
        };
      case "info":
      default:
        return {
          dot: "bg-blue-500",
          text: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-500/10",
        };
    }
  };

  const visitorsFormatted =
    typeof uniqueVisitors === "number"
      ? uniqueVisitors.toLocaleString()
      : uniqueVisitors;

  return (
    <div
      className={`h-full min-h-[480px] lg:h-[540px] xl:h-[560px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden ${className}`}
    >
      {/* 1. Compact Header */}
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              AI Insights
            </h2>
          </div>
          <p className="text-[10px] text-slate-400">
            Automated spatial analysis
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* 2. Scrollable Insights Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 px-3.5 py-2 space-y-2.5 min-h-0">
        {list.map((item, idx) => {
          const badge = getSeverityBadge(item.severity);
          return (
            <div key={idx} className={idx > 0 ? "pt-2.5" : ""}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                <span
                  className={`text-[9px] font-bold tracking-wider uppercase ${badge.text}`}
                >
                  {item.category}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}

        {/* Integrated Camera Coverage & Deduplication */}
        <div className="pt-2.5">
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-md border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Video className="w-3 h-3 text-slate-500" />
                Camera Coverage
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cross-camera Re-ID: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mb-1.5">
              <div className="px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">CAM 01</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ACTIVE</span>
              </div>
              <div className="px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">CAM 02</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ACTIVE</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400">Unique customers:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {visitorsFormatted} (deduplicated)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact Footer */}
      <div className="px-3.5 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span>Latency: 42ms</span>
        <span>YOLOv8 + ByteTrack</span>
      </div>
    </div>
  );
}
