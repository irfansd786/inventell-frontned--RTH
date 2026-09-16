import React from 'react';
import {
  Layers,
  AlertTriangle,
  PackageX,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export default function ShelfKpiRow({ metrics = {} }) {
  const {
    shelvesMonitored = 4,
    shelvesMonitoredSub = 'Monitored store aisles',
    lowStockItems = 0,
    lowStockSub = 'Calculated from inventory',
    emptySlots = null,
    emptySlotsLabel = 'Awaiting shelf detection',
    emptySlotsSub = 'YOLO COCO Person Only • Shelf CV Pending',
    shelfHealth = '70%',
    shelfHealthSub = 'Calculated from inventory',
    stockoutRisk = 'LOW',
    stockoutRiskSub = 'Demand vs store stock',
  } = metrics;

  const hasEmptySlotDetection = typeof emptySlots === 'number';

  const getRiskBadge = (risk) => {
    switch ((risk || '').toUpperCase()) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          dot: 'bg-red-500',
        };
      case 'HIGH':
        return {
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
        };
      default:
        return {
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
    }
  };

  const riskStyle = getRiskBadge(stockoutRisk);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* Metric 1: Shelves Monitored */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Shelves Monitored
          </span>
          <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {shelvesMonitored.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            bays
          </span>
        </div>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
          {shelvesMonitoredSub}
        </p>
      </div>

      {/* Metric 2: Low Stock Items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Low Stock Items
          </span>
          <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {lowStockItems.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            facings
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
          {lowStockSub}
        </p>
      </div>

      {/* Metric 3: Empty Slots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Empty Slots
          </span>
          <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <PackageX className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          {hasEmptySlotDetection ? (
            <>
              <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400 tracking-tight">
                {emptySlots.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-red-500 font-medium">voids</span>
            </>
          ) : (
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              Awaiting detection
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
          {hasEmptySlotDetection ? emptySlotsSub : 'Awaiting shelf model (COCO Person active)'}
        </p>
      </div>

      {/* Metric 4: Shelf Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Shelf Health
          </span>
          <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {shelfHealth}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            compliance
          </span>
        </div>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
          {shelfHealthSub}
        </p>
      </div>

      {/* Metric 5: Stockout Risk */}
      <div className="col-span-2 md:col-span-3 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Stockout Risk
          </span>
          <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border tracking-wide ${riskStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
            {stockoutRisk}
          </div>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
          {stockoutRiskSub}
        </p>
      </div>
    </div>
  );
}
