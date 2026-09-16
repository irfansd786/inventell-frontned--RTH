import React from 'react';
import { Layers, AlertTriangle, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

export default function AllocationTable({
  items = [],
  selectedKeys = [],
  onToggleSelectAll,
  onToggleSelectOne,
  onOpenAllocateModal,
  onSendToPicking,
  onReviewShortfall,
  currentPage,
  pageSize,
  totalItemsCount,
  onPageChange,
}) {
  const allSelected = items.length > 0 && items.every((it) => selectedKeys.includes(`${it.orderId}-${it.sku}`));
  const someSelected = items.some((it) => selectedKeys.includes(`${it.orderId}-${it.sku}`)) && !allSelected;

  const totalPages = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItemsCount);

  // Semantic Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Fully Allocated':
      case 'Ready for Picking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{status}</span>
          </span>
        );
      case 'Partially Allocated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Partially Allocated</span>
          </span>
        );
      case 'Shortfall':
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Shortfall</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Pending</span>
          </span>
        );
    }
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
      case 'low':
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
        <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
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
                  aria-label="Select all allocation items"
                />
              </th>
              <th className="py-3 px-3 w-32">ORDER ID</th>
              <th className="py-3 px-3 min-w-[180px] sticky left-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                PRODUCT
              </th>
              <th className="py-3 px-3 w-24">SKU</th>
              <th className="py-3 px-3 w-28">BARCODE</th>
              <th className="py-3 px-3 text-right w-20">REQUIRED</th>
              <th className="py-3 px-3 text-right w-20">AVAILABLE</th>
              <th className="py-3 px-3 text-right w-20">ALLOCATED</th>
              <th className="py-3 px-3 text-right w-20">SHORTFALL</th>
              <th className="py-3 px-3 min-w-[130px]">SOURCE</th>
              <th className="py-3 px-3 min-w-[130px]">DESTINATION</th>
              <th className="py-3 px-3 text-center w-24">PRIORITY</th>
              <th className="py-3 px-3 text-center w-32">STATUS</th>
              <th className="py-3 px-3 text-right min-w-[120px] sticky right-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.length > 0 ? (
              items.map((it, idx) => {
                const itemKey = `${it.orderId}-${it.sku}`;
                const isSelected = selectedKeys.includes(itemKey);
                const hasShortfall = it.shortfall > 0;
                const isFullyAllocated = it.allocated >= it.required;
                const isReady = it.status === 'Ready for Picking' || isFullyAllocated;

                return (
                  <tr
                    key={`${itemKey}-${idx}`}
                    onClick={() => onOpenAllocateModal(it)}
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
                        onChange={() => onToggleSelectOne(itemKey)}
                        className="rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 cursor-pointer"
                        aria-label={`Select item ${it.sku}`}
                      />
                    </td>

                    {/* 2. Order ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {it.orderId}
                    </td>

                    {/* 3. Product (Sticky Left) */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                      <div className="truncate max-w-[220px]" title={it.product}>
                        {it.product}
                      </div>
                    </td>

                    {/* 4. SKU */}
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{it.sku}</td>

                    {/* 5. Barcode */}
                    <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                      {it.barcode || 'Barcode unavailable'}
                    </td>

                    {/* 6. Required */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {it.required}
                    </td>

                    {/* 7. Available */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-semibold ${
                        it.warehouseStock === 0
                          ? 'text-red-600 font-bold'
                          : it.warehouseStock < it.required
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {it.warehouseStock}
                    </td>

                    {/* 8. Allocated */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {it.allocated || 0}
                    </td>

                    {/* 9. Shortfall */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          hasShortfall ? 'text-red-700 dark:text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {it.shortfall || 0}
                      </span>
                    </td>

                    {/* 10. Source */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[130px]" title={it.source}>
                      {it.source || 'Central Warehouse'}
                    </td>

                    {/* 11. Destination */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]" title={it.destination}>
                      {it.destination || 'Main Street Store'}
                    </td>

                    {/* 12. Priority */}
                    <td className="py-3 px-3 text-center">{getPriorityBadge(it.priority)}</td>

                    {/* 13. Status */}
                    <td className="py-3 px-3 text-center">{getStatusBadge(it.status)}</td>

                    {/* 14. Action (Sticky Right) */}
                    <td
                      className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-slate-900 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {isReady ? (
                          <button
                            type="button"
                            onClick={() => onSendToPicking(it.orderId)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="Release order to warehouse picking floor"
                          >
                            <span>Send to Picking</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : hasShortfall && it.warehouseStock === 0 ? (
                          <button
                            type="button"
                            onClick={() => onReviewShortfall(it)}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 border border-red-200 text-red-800 dark:text-red-300 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Review inventory shortage"
                          >
                            Review
                          </button>
                        ) : it.status === 'Partially Allocated' ? (
                          <button
                            type="button"
                            onClick={() => onOpenAllocateModal(it)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Continue allocating inventory"
                          >
                            Continue
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAllocateModal(it)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                            title="Allocate warehouse stock"
                          >
                            Allocate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No allocation items match filters
                    </p>
                    <p className="text-xs text-slate-400">
                      Try resetting status, priority, or search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItemsCount > 0 && (
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItemsCount}</span> items
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
