import React from 'react';
import { Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { getOrderProductSummary } from '../../utils/warehouseUtils';

export default function DispatchTable({
  orders = [],
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
  onOpenDispatchModal,
  currentPage,
  pageSize,
  totalOrdersCount,
  onPageChange,
}) {
  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));
  const someSelected = orders.some((o) => selectedIds.includes(o.id)) && !allSelected;

  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalOrdersCount);

  // Semantic Status Badge
  const getStatusBadge = (status, totalPacked, totalRequired) => {
    if (status === 'Exception' || status === 'Blocked') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Blocked</span>
        </span>
      );
    }
    if (status === 'Delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (status === 'Dispatched') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
          <Truck className="w-3 h-3 text-blue-600" />
          <span>In Transit</span>
        </span>
      );
    }
    if (totalPacked >= totalRequired && totalRequired > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Ready for Dispatch</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Packing Incomplete</span>
      </span>
    );
  };

  // Priority Badge
  const getPriorityBadge = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
            HIGH
          </span>
        );
      case 'normal':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 cursor-pointer"
                  aria-label="Select all dispatch orders"
                />
              </th>
              <th className="py-3 px-3 w-32 sticky left-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                ORDER ID
              </th>
              <th className="py-3 px-3 min-w-[190px]">PRODUCTS</th>
              <th className="py-3 px-3 text-right w-24">TOTAL UNITS</th>
              <th className="py-3 px-3 min-w-[140px]">DESTINATION</th>
              <th className="py-3 px-3 min-w-[160px]">CARRIER / METHOD</th>
              <th className="py-3 px-3 text-center w-24">PRIORITY</th>
              <th className="py-3 px-3 w-28">EXPECTED DATE</th>
              <th className="py-3 px-3 text-center w-36">STATUS</th>
              <th className="py-3 px-3 text-right min-w-[130px] sticky right-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.length > 0 ? (
              orders.map((ord, idx) => {
                const isSelected = selectedIds.includes(ord.id);
                const items = ord.items || [];
                const totalUnits = items.reduce((sum, it) => sum + Number(it.requested || 0), 0);
                const totalPacked = items.reduce(
                  (sum, it) => sum + Number(it.packed !== undefined ? it.packed : (['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(ord.status) ? it.picked : 0)),
                  0
                );
                const isReady = totalPacked >= totalUnits && totalUnits > 0;
                const isDispatched = ord.status === 'Dispatched' || ord.status === 'Delivered';
                const prodSummary = getOrderProductSummary(ord);

                return (
                  <tr
                    key={`${ord.id}-${idx}`}
                    onClick={() => onOpenDispatchModal(ord)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/70 dark:bg-slate-800/80'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* 1. Checkbox */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOne(ord.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 cursor-pointer"
                        aria-label={`Select order ${ord.id}`}
                      />
                    </td>

                    {/* 2. Order ID (Sticky Left) */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                      {ord.id}
                    </td>

                    {/* 3. Products */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      <div>{prodSummary.label}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {prodSummary.namesSummary}
                      </span>
                    </td>

                    {/* 4. Total Units */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {totalUnits}
                    </td>

                    {/* 5. Destination */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={ord.destination}>
                      {ord.destination || 'Main Street Store'}
                    </td>

                    {/* 6. Carrier */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[160px]" title={ord.carrier}>
                      {ord.carrier || 'Dedicated Fleet - Van #3'}
                    </td>

                    {/* 7. Priority */}
                    <td className="py-3 px-3 text-center">{getPriorityBadge(ord.priority)}</td>

                    {/* 8. Expected Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {ord.expectedDate || '11 Sep 2026'}
                    </td>

                    {/* 9. Status */}
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(ord.status, totalPacked, totalUnits)}
                    </td>

                    {/* 10. Action (Sticky Right) */}
                    <td
                      className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-slate-900 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {isDispatched ? (
                          <button
                            type="button"
                            onClick={() => onOpenDispatchModal(ord)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Track
                          </button>
                        ) : isReady ? (
                          <button
                            type="button"
                            onClick={() => onOpenDispatchModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>Dispatch</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenDispatchModal(ord)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No dispatch orders match filters
                    </p>
                    <p className="text-xs text-slate-400">
                      Orders must be packed and sealed before appearing on the dispatch dock.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalOrdersCount > 0 && (
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalOrdersCount}</span> orders
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-semibold"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
