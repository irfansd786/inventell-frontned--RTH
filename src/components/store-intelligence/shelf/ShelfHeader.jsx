import React from 'react';
import {
  Layers,
  RefreshCw,
  Download,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';

const AISLE_OPTIONS = [
  { id: 'aisle-01', label: 'Aisle 01 — Beverages' },
  { id: 'aisle-02', label: 'Aisle 02 — Snacks & Packaged' },
  { id: 'aisle-03', label: 'Aisle 03 — Dairy & Refrigerated' },
  { id: 'aisle-04', label: 'Aisle 04 — Personal Care' },
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'soft-drinks', label: 'Soft Drinks & Sodas' },
  { id: 'snacks', label: 'Packaged Snacks' },
  { id: 'juices', label: 'Juices & Energy Drinks' },
  { id: 'water', label: 'Bottled Water' },
];

export default function ShelfHeader({
  selectedAisle = 'aisle-01',
  onAisleChange,
  selectedCategory = 'all',
  onCategoryChange,
  onRefresh,
  onExport,
  isRefreshing = false,
  statusLabel = 'ANALYSIS RUNNING',
  dataProvenance = 'Database Inventory + CCTV Tracking',
}) {
  const isRunning = statusLabel === 'ANALYSIS RUNNING' || statusLabel === 'VIDEO ANALYSIS';

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-4 py-2.5 shadow-sm transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-h-[44px]">
        {/* Left: Title, Subtitle, and Analysis Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  Shelf Intelligence
                </h1>
                {/* Status Badge: ANALYSIS RUNNING (strict requirement: never call recorded video "LIVE") */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isRunning
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {statusLabel}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {dataProvenance}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                Computer vision planogram compliance, stock availability & interaction tracking
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls (Aisle, Category, Refresh, Export) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Aisle Selector */}
          <div className="relative">
            <select
              value={selectedAisle}
              onChange={(e) => onAisleChange?.(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 pl-2.5 pr-7 py-1.5 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              {AISLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <SlidersHorizontal className="w-3 h-3" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 pl-2.5 pr-7 py-1.5 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter className="w-3 h-3" />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition active:scale-95 disabled:opacity-60"
            title="Refresh Shelf Telemetry"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
            title="Export Shelf Compliance Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
