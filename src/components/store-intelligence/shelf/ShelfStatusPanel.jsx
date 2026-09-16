import React from 'react';
import { Layers, AlertCircle, CheckCircle, PackageX, Zap, ArrowUpRight } from 'lucide-react';

const STATUS_CONFIG = {
  COMPLIANT: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
    label: 'COMPLIANT',
  },
  RESTOCK_NEEDED: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    label: 'RESTOCK NEEDED',
  },
  CRITICAL_VOID: {
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    bar: 'bg-red-500 animate-pulse',
    label: 'CRITICAL VOID',
  },
};

export default function ShelfStatusPanel({
  bays = [],
  onInspectBay,
  onRequestRestock,
}) {
  const compliantCount = bays.filter((b) => b.status === 'COMPLIANT').length;
  const totalCount = bays.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Shelf Bay Monitoring
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Aisle compliance & planogram status
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            {compliantCount}/{totalCount} Compliant
          </span>
        </div>
      </div>

      {/* Bay List */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 overflow-y-auto">
        {bays.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Layers className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No Shelf Bays Configured
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Waiting for analysis • Store inventory and zone mapping initializing
            </p>
          </div>
        ) : (
          bays.map((bay) => {
          const cfg = STATUS_CONFIG[bay.status] || STATUS_CONFIG.COMPLIANT;
          const isCritical = bay.status === 'CRITICAL_VOID';
          const isRestock = bay.status === 'RESTOCK_NEEDED';
          const hasVoidCount = typeof bay.voids === 'number';

          return (
            <div
              key={bay.id}
              className={`p-2.5 rounded-md border transition-all ${
                isCritical
                  ? 'border-red-300/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/15 ring-1 ring-red-500/20'
                  : isRestock
                  ? 'border-amber-300/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Bay Name & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {bay.name}
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border shrink-0 ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Metrics: Voids + Interactions */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <PackageX
                    className={`w-3.5 h-3.5 shrink-0 ${
                      hasVoidCount && bay.voids > 0 ? 'text-red-500' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    Empty Slots:{' '}
                    <strong
                      className={`font-mono font-semibold ${
                        hasVoidCount && bay.voids > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {hasVoidCount ? bay.voids.toString().padStart(2, '0') : 'Pending CV'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>
                    Visits:{' '}
                    <strong className="text-slate-800 dark:text-slate-100 font-mono font-semibold">
                      {bay.interactions != null ? `${bay.interactions}` : 'Nominal'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Health Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Planogram Health</span>
                  <span className="font-mono font-medium">{bay.health}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`}
                    style={{ width: `${Math.min(bay.health, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action row */}
              {(isCritical || isRestock) && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isCritical ? 'Immediate void replenishment' : 'Low facing buffer'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRequestRestock?.(bay.id)}
                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 transition inline-flex items-center gap-0.5"
                  >
                    <span>Request Restock</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
