import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  Flame,
  Navigation,
  RefreshCw,
  Video,
  Layers,
  Sparkles,
} from "lucide-react";
import Button from "../../common/Button";

const CAMERAS = [
  { id: "combined", label: "All Cameras", sub: "Combined Store Heatmap" },
  { id: "camera_01", label: "Camera 01", sub: "Entrance / Front Store" },
  { id: "camera_02", label: "Camera 02", sub: "Aisles / Checkout" },
];

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "custom", label: "Custom Date" },
];

const TIME_RANGES = [
  { id: "15m", label: "Last 15 min" },
  { id: "1h", label: "Last 1 hour" },
  { id: "6h", label: "Last 6 hours" },
  { id: "all", label: "Today (All Day)" },
];

const METRICS = [
  { id: "traffic", label: "Traffic Density", icon: Flame },
  { id: "dwell", label: "Dwell Density", icon: Clock },
  { id: "movement", label: "Movement Paths", icon: Navigation },
];

export default function HeatmapHeader({
  cameraId = "combined",
  onCameraChange,
  period = "today",
  onPeriodChange,
  timeRange = "all",
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
  reason = "",
  bothAnalyzing = true,
  reidActive = true,
}) {
  const [showCustom, setShowCustom] = useState(period === "custom");

  const handlePeriodClick = (pId) => {
    onPeriodChange(pId);
    setShowCustom(pId === "custom");
  };

  return (
    <div className="space-y-2.5">
      {/* Main Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 px-4 py-3 shadow-xs">
        {/* Left: Title, subtitle & live status badge */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Zone
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                bothAnalyzing
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  bothAnalyzing ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {bothAnalyzing ? "2 CAMERAS ACTIVE" : "CAMERAS CONNECTING"}
            </span>

            {reidActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Cross-Camera Re-ID Synchronized
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analyze customer traffic, movement, and activity across store zones.
          </p>
        </div>

        {/* Right Action Controls: Refresh & Export */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={onRefresh}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 h-8 text-xs font-semibold"
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={onExport}
            disabled={!canExport}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 h-8 text-xs font-semibold"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Filter Toolbar: Camera Selector + Date Filter + Time Range + Metric Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800 px-3 py-2">
        {/* Camera Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Video className="w-3.5 h-3.5 text-blue-500" />
            Camera:
          </span>
          <div className="inline-flex items-center bg-white dark:bg-slate-950 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
            {CAMERAS.map((cam) => {
              const active = cameraId === cam.id;
              return (
                <button
                  key={cam.id}
                  onClick={() => onCameraChange?.(cam.id)}
                  title={cam.sub}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cam.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Date:
          </span>
          <div className="inline-flex items-center bg-white dark:bg-slate-950 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
            {PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePeriodClick(p.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Time:
          </span>
          <div className="inline-flex items-center bg-white dark:bg-slate-950 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
            {TIME_RANGES.map((tr) => {
              const active = timeRange === tr.id;
              return (
                <button
                  key={tr.id}
                  onClick={() => onTimeRangeChange?.(tr.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Mode */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Metric:
          </span>
          <div className="inline-flex items-center bg-white dark:bg-slate-950 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
            {METRICS.map((m) => {
              const active = metric === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => onMetricChange?.(m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white dark:bg-blue-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Window Inputs */}
      {showCustom && period === "custom" && (
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Session Window Range (Seconds):
          </span>
          <input
            type="number"
            placeholder="Start (0)"
            value={customStart}
            onChange={(e) => onCustomStart?.(e.target.value)}
            className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="number"
            placeholder="End (120)"
            value={customEnd}
            onChange={(e) => onCustomEnd?.(e.target.value)}
            className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
          />
          <Button variant="primary" size="sm" onClick={onApplyWindow} className="h-6 text-xs px-2.5">
            Apply
          </Button>
        </div>
      )}

      {reason && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
}
