import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, Power, UserCheck } from 'lucide-react';

const STATUS_CONFIG = {
  NORMAL: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    label: 'NORMAL',
  },
  BUSY: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    label: 'BUSY',
  },
  CRITICAL: {
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    bar: 'bg-red-500 animate-pulse',
    dot: 'bg-red-500 animate-ping',
    label: 'CRITICAL',
  },
  STANDBY: {
    badge: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
    bar: 'bg-slate-300 dark:bg-slate-700',
    dot: 'bg-slate-400',
    label: 'STANDBY',
  },
};

export default function CheckoutStatusPanel({
  lanes = [],
  onOpenLane,
}) {
  const activeCount = lanes.filter((l) => l.status !== 'STANDBY').length;
  const totalCount = lanes.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Checkout Lane Monitoring
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time lane occupancy & throughput
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            {activeCount}/{totalCount} Active
          </span>
        </div>
      </div>

      {/* Lanes List */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 overflow-y-auto">
        {lanes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Users className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No Checkout Lanes Detected
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Waiting for analysis • POS checkout zone telemetry initializing
            </p>
          </div>
        ) : (
          lanes.map((lane) => {
          const cfg = STATUS_CONFIG[lane.status] || STATUS_CONFIG.NORMAL;
          const isCritical = lane.status === 'CRITICAL';
          const isStandby = lane.status === 'STANDBY';

          return (
            <div
              key={lane.id}
              className={`p-2.5 rounded-md border transition-all ${
                isCritical
                  ? 'border-rose-300/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/15 ring-1 ring-rose-500/20'
                  : isStandby
                  ? 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 opacity-75 hover:opacity-100'
                  : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Lane Title & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {lane.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                    • {lane.cashier}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border shrink-0 ${cfg.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              </div>

              {/* Lane Metrics Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Queue:{' '}
                    <strong className="text-slate-800 dark:text-slate-100 font-mono font-semibold">
                      {lane.queue.toString().padStart(2, '0')}
                    </strong>{' '}
                    <span className="text-slate-400 text-[10px]">
                      /{lane.maxQueue}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Wait:{' '}
                    <strong
                      className={`font-mono font-semibold ${
                        isCritical
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {lane.waitTime}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Occupancy</span>
                  <span className="font-mono font-medium">{lane.occupancy}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`}
                    style={{ width: `${Math.min(lane.occupancy, 100)}%` }}
                  />
                </div>
              </div>

              {/* Contextual Action / Warning for Critical or Standby */}
              {isCritical && (
                <div className="mt-2 pt-1.5 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-300 font-medium">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Queue exceeds safe SLA (&gt;5m)
                  </span>
                  <span className="underline cursor-pointer hover:text-rose-800 dark:hover:text-rose-200">
                    Dispatch Alert
                  </span>
                </div>
              )}

              {isStandby && (
                <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Power className="w-3 h-3 text-slate-400" />
                    Ready to activate
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenLane?.(lane.id)}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 transition"
                  >
                    Open Lane
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
