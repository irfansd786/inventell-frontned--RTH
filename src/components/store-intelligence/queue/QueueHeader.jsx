import React from "react";
import { Download, RefreshCw, Video, Sliders, ShieldCheck } from "lucide-react";

const CAMERAS = [
  { id: "camera_01", label: "Camera 01 — POS Checkout FOV" },
  { id: "camera_02", label: "Camera 02 — Main Entrance & Aisles" },
  { id: "all", label: "Combined Store Summary (Dual-Camera Re-ID)" },
];

const TIME_WINDOWS = [
  { id: "1h", label: "Last 1 Hour" },
  { id: "15m", label: "Last 15 Minutes" },
  { id: "today", label: "Today (Shift 1 & 2)" },
  { id: "all", label: "All Day" },
];

const QUEUE_STATUS_OPTIONS = [
  { id: "ALL", label: "All Statuses" },
  { id: "NORMAL", label: "Normal" },
  { id: "MODERATE", label: "Moderate" },
  { id: "HIGH", label: "High Alert" },
  { id: "CRITICAL", label: "Critical" },
];

export default function QueueHeader({
  selectedCamera = "camera_01",
  onCameraChange,
  selectedInterval = "1h",
  onIntervalChange,
  selectedStatusFilter = "ALL",
  onStatusFilterChange,
  threshold = 6,
  onOpenThresholdModal,
  onRefresh,
  onExport,
  isRefreshing = false,
  statusLabel = "VIDEO ANALYSIS",
  dataProvenance = "CCTV Video Analysis (COCO Person Detection + ByteTrack)",
}) {
  const isRunning = statusLabel === "ANALYSIS RUNNING" || statusLabel === "VIDEO ANALYSIS";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 px-3.5 py-2.5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        {/* LEFT: Title & Subtitle */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Queue Intelligence
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                isRunning
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {statusLabel}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {dataProvenance}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Monitor checkout queues and receive AI-powered operational recommendations
          </p>
        </div>

        {/* RIGHT: Compact Enterprise Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Camera Selector */}
          <select
            value={selectedCamera}
            onChange={(e) => onCameraChange?.(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="CCTV Stream Selector"
          >
            {CAMERAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Time Window Selector */}
          <select
            value={selectedInterval}
            onChange={(e) => onIntervalChange?.(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Time Range Window"
          >
            {TIME_WINDOWS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Queue Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value)}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Filter by Queue State"
          >
            {QUEUE_STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Threshold Configure Button */}
          <button
            type="button"
            onClick={onOpenThresholdModal}
            className="h-8 inline-flex items-center gap-1 px-2.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Configure Queue Thresholds"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>Threshold: {threshold}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh queue analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={onExport}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            title="Export Queue Analytics Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}