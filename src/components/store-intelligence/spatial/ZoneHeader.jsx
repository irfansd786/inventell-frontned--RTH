import React, { useState } from "react";
import { Download, RefreshCw } from "lucide-react";

const CAMERAS = [
  { id: "combined", label: "Camera: All" },
  { id: "camera_01", label: "Cam 01 — Front" },
  { id: "camera_02", label: "Cam 02 — Aisles" },
];

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "custom", label: "Custom Range" },
];

const TIME_RANGES = [
  { id: "1h", label: "Last 1 Hour" },
  { id: "15m", label: "Last 15m" },
  { id: "6h", label: "Last 6 Hours" },
  { id: "all", label: "All Day" },
];

const METRICS = [
  { id: "traffic", label: "Traffic Density" },
  { id: "dwell", label: "Dwell Density" },
  { id: "movement", label: "Movement Paths" },
];

export default function ZoneHeader({
  cameraId = "combined",
  onCameraChange,
  period = "today",
  onPeriodChange,
  timeRange = "1h",
  onTimeRangeChange,
  metric = "traffic",
  onMetricChange,
  onRefresh,
  onExport,
  canExport = true,
  customStart = "",
  customEnd = "",
  onCustomStart,
  onCustomEnd,
  onApplyWindow,
  bothAnalyzing = true,
  reidActive = true,
}) {
  const [showCustom, setShowCustom] = useState(period === "custom");

  const handlePeriodChange = (val) => {
    onPeriodChange(val);
    setShowCustom(val === "custom");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 px-3.5 py-2.5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        {/* LEFT: Title & Subtitle */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Zone
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {bothAnalyzing ? "2 CAMERAS ACTIVE" : "CAMERAS SYNCING"}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Customer movement &amp; spatial analytics
          </p>
        </div>

        {/* RIGHT: Compact Enterprise Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Camera Selector */}
          <select
            value={cameraId}
            onChange={(e) => onCameraChange(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Select CCTV Camera Stream"
          >
            {CAMERAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Date Selector */}
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Date Period Filter"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Time Window Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Time Range Filter"
          >
            {TIME_RANGES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Primary Analytics Metric"
          >
            {METRICS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent transition-colors"
            title="Refresh analytics telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            disabled={!canExport}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            title="Export full zone telemetry report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Custom Window Drawer (When Custom is selected) */}
      {showCustom && period === "custom" && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Session Window:
          </span>
          <input
            type="number"
            placeholder="Start (0s)"
            value={customStart}
            onChange={(e) => onCustomStart?.(e.target.value)}
            className="w-24 h-7 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
          <span className="text-slate-400">to</span>
          <input
            type="number"
            placeholder="End (120s)"
            value={customEnd}
            onChange={(e) => onCustomEnd?.(e.target.value)}
            className="w-24 h-7 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={onApplyWindow}
            className="h-7 px-2.5 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
