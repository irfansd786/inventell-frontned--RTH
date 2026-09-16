import React, { useState } from "react";
import {
  Calendar,
  Download,
  MapPin,
  RefreshCw,
  Video,
} from "lucide-react";
import Button from "../../common/Button";

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "custom", label: "Custom Window" },
];

export default function ZonesHeader({
  cameras,
  bothAnalyzing,
  period,
  onPeriodChange,
  onRefresh,
  onExport,
  canExport = true,
  customStart = "",
  customEnd = "",
  onCustomStart,
  onCustomEnd,
  onApplyWindow,
  reason = "",
}) {
  const [showCustom, setShowCustom] = useState(false);

  const handlePeriodClick = (pId) => {
    onPeriodChange(pId);
    setShowCustom(pId === "custom");
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Store Zones
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
              ● 2 CAMERAS ANALYZING
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor customer occupancy, engagement and movement across every store zone.
          </p>
        </div>

        {/* Right side controls: Date Range, Refresh, Export Report */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
            {PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePeriodClick(p.id)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    active
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={onRefresh}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 h-8"
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={onExport}
            disabled={!canExport}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 h-8"
          >
            Export Report
          </Button>
        </div>
      </div>

      {showCustom && period === "custom" && (
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Session Window (sec):</span>
          <input
            type="number"
            placeholder="Start (e.g. 0)"
            value={customStart}
            onChange={(e) => onCustomStart?.(e.target.value)}
            className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="number"
            placeholder="End (e.g. 120)"
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
