import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Package, Check } from 'lucide-react';
import { getOrderProductSummary } from '../../utils/warehouseUtils';

export default function PackingTable({
  orders = [],
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
  onOpenPackModal,
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

  // Status badge
  const getStatusBadge = (status, totalPacked, totalPicked) => {
    if (status === 'Exception' || status === 'Blocked') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Exception</span>
        </span>
      );
    }
    if (status === 'Packed' || status === 'Ready for Dispatch' || (totalPicked > 0 && totalPacked >= totalPicked)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Packed</span>
        </span>
      );
    }
    if (status === 'Partially Packed' || (totalPacked > 0 && totalPacked < totalPicked)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Partially Packed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Ready for Packing</span>
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
        <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
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
                  aria-label="Select all packing orders"
                />
              </th>
              <th className="py-3 px-3 w-32 sticky left-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                ORDER ID
              </th>
              <th className="py-3 px-3 min-w-[200px]">PRODUCTS</th>
              <th className="py-3 px-3 text-right w-24">TOTAL UNITS</th>
              <th className="py-3 px-3 text-right w-24">PICKED</th>
              <th className="py-3 px-3 text-right w-24">PACKED</th>
              <th className="py-3 px-3 text-right w-24">REMAINING</th>
              <th className="py-3 px-3 min-w-[150px]">DESTINATION</th>
              <th className="py-3 px-3 text-center w-24">PRIORITY</th>
              <th className="py-3 px-3 text-center w-32">STATUS</th>
              <th className="py-3 px-3 text-right min-w-[140px] sticky right-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]">
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
                const totalPicked = items.reduce((sum, it) => sum + Number(it.picked || it.allocated || 0), 0);
                const totalPacked = items.reduce(
                  (sum, it) => sum + Number(it.packed !== undefined ? it.packed : (['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(ord.status) ? it.picked : 0)),
                  0
                );
                const remaining = Math.max(0, totalPicked - totalPacked);
                const isPacked = totalPicked > 0 && remaining === 0;
                const prodSummary = getOrderProductSummary(ord);

                return (
                  <tr
                    key={`${ord.id}-${idx}`}
                    onClick={() => onOpenPackModal(ord)}
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

                    {/* 5. Picked */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {totalPicked}
                    </td>

                    {/* 6. Packed */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {totalPacked}
                    </td>

                    {/* 7. Remaining */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`font-bold ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {remaining}
                      </span>
                    </td>

                    {/* 8. Destination */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={ord.destination}>
                      {ord.destination || 'Main Street Store'}
                    </td>

                    {/* 9. Priority */}
                    <td className="py-3 px-3 text-center">{getPriorityBadge(ord.priority)}</td>

                    {/* 10. Status */}
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(ord.status, totalPacked, totalPicked)}
                    </td>

                    {/* 11. Action (Sticky Right) */}
                    <td
                      className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-slate-900 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {isPacked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 py-1 px-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Packed</span>
                          </span>
                        ) : totalPacked > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenPackModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Continue Packing
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenPackModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>Pack</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No packing tasks match filters
                    </p>
                    <p className="text-xs text-slate-400">
                      Orders must be picked on the picking floor before appearing for packing.
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
