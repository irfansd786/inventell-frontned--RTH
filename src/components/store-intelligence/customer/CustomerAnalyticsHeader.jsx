import React from 'react';
import { RefreshCw, Download, Calendar, Camera, Layers, GitCompare } from 'lucide-react';
import Button from '../../common/Button';
import { PERIOD_LABELS } from '../../../services/customerService';

const PERIOD_OPTIONS = ['today', '7d', '30d', 'custom'];

const selectClass =
  'text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-2 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer shadow-2xs';

export default function CustomerAnalyticsHeader({
  period,
  onPeriodChange,
  camera,
  onCameraChange,
  zone,
  onZoneChange,
  compare,
  onCompareToggle,
  zonesList = [],
  onRefresh,
  onExport,
  canExport,
  customStart,
  customEnd,
  onCustomStart,
  onCustomEnd,
  onApplyWindow,
  reason,
}) {
  return (
    <div className="space-y-3">
      {/* Enterprise Header: Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CUSTOMER ANALYTICS
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Behavioral Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customer behavior, journey and engagement intelligence derived from CCTV telemetry and store analytics.
          </p>
        </div>

        {/* Functional Analytical Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* 1. Date Range Filter */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              id="ca-period-filter"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className={selectClass}
              aria-label="Select Date Range"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>{PERIOD_LABELS[p] || p}</option>
              ))}
            </select>
          </div>

          {/* 2. Camera Filter */}
          <div className="relative inline-flex items-center">
            <Camera className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              id="ca-camera-filter"
              value={camera}
              onChange={(e) => onCameraChange(e.target.value)}
              className={selectClass}
              aria-label="Select Camera Filter"
            >
              <option value="all">All Cameras</option>
              <option value="camera_01">Camera 1 (Entrance/Grocery)</option>
              <option value="camera_02">Camera 2 (Beverages/Checkout)</option>
            </select>
          </div>

          {/* 3. Zone Filter */}
          <div className="relative inline-flex items-center">
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              id="ca-zone-filter"
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              className={selectClass}
              aria-label="Select Zone Filter"
            >
              <option value="all">All Zones</option>
              {zonesList.map((z) => (
                <option key={z.id || z.name} value={z.id || z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Compare Toggle */}
          <button
            type="button"
            onClick={onCompareToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              compare
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Compare analytics with previous period"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{compare ? 'Comparing' : 'Compare'}</span>
          </button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={onRefresh}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs"
          >
            Refresh
          </Button>

          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={onExport}
            disabled={!canExport}
            className="text-xs font-semibold"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Custom Window Drawer */}
      {period === 'custom' && (
        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs shadow-2xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Session Window Range (seconds):
          </span>
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            Start
            <input
              type="number"
              min="0"
              value={customStart}
              onChange={(e) => onCustomStart(e.target.value)}
              placeholder="0"
              className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            End
            <input
              type="number"
              min="0"
              value={customEnd}
              onChange={(e) => onCustomEnd(e.target.value)}
              placeholder="end"
              className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={onApplyWindow}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 text-xs py-1"
          >
            Apply Range
          </Button>
        </div>
      )}

      {reason && (
        <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs text-amber-800 dark:text-amber-200 font-medium">
          {reason}
        </div>
      )}
    </div>
  );
}
