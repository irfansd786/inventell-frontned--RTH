import React from 'react';
import { Eye, AlertTriangle, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function OrderTable({
  orders = [],
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
  onSelectOrder,
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

  // Status badge styling
  const getStatusBadge = (status, isAtRisk) => {
    if (isAtRisk || (status || '').toLowerCase() === 'at risk') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>At Risk</span>
        </span>
      );
    }

    switch ((status || '').toLowerCase()) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span>Draft</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Pending</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Confirmed</span>
          </span>
        );
      case 'allocated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span>Allocated</span>
          </span>
        );
      case 'picking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50/80 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Picking</span>
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Packed</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Priority badge styling
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
                  aria-label="Select all orders"
                />
              </th>
              <th className="py-3 px-3 w-32">ORDER ID</th>
              <th className="py-3 px-3 w-28">DATE</th>
              <th className="py-3 px-3 w-28">TYPE</th>
              <th className="py-3 px-3 min-w-[150px]">PRODUCTS</th>
              <th className="py-3 px-3 text-right w-24">QUANTITY</th>
              <th className="py-3 px-3 text-right w-28">VALUE</th>
              <th className="py-3 px-3 min-w-[140px]">SOURCE</th>
              <th className="py-3 px-3 min-w-[140px]">DESTINATION</th>
              <th className="py-3 px-3 text-center w-24">PRIORITY</th>
              <th className="py-3 px-3 text-center w-28">STATUS</th>
              <th className="py-3 px-3 w-28">EXPECTED</th>
              <th className="py-3 px-3 text-right w-20 sticky right-0 bg-slate-50 dark:bg-slate-800/95 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.length > 0 ? (
              orders.map((ord) => {
                const isSelected = selectedIds.includes(ord.id);
                const itemsCount = ord.items?.length || ord.itemsCount || 1;
                const totalUnits = ord.totalUnits || ord.items?.reduce((s, it) => s + (it.requested || 0), 0) || 0;
                const totalVal =
                  ord.totalAmount ||
                  ord.items?.reduce(
                    (s, it) => s + (it.subtotal || (it.requested || 0) * (it.unitPrice || 0)),
                    0
                  ) ||
                  0;

                return (
                  <tr
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
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

                    {/* 2. Order ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.id}</span>
                        {ord.isAtRisk && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </div>
                    </td>

                    {/* 3. Date */}
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {ord.dateLabel || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '09 Sep')}
                    </td>

                    {/* 4. Type */}
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {ord.type || 'Replenishment'}
                    </td>

                    {/* 5. Products */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {itemsCount} {itemsCount === 1 ? 'product' : 'products'}
                        </span>
                        {ord.items && ord.items.length > 0 && (
                          <span
                            className="text-[10px] text-slate-400 block truncate max-w-[200px]"
                            title={ord.items.map((it) => `${it.product || it.name} (${it.requested}u)`).join(', ')}
                          >
                            {ord.items.map((it) => it.product || it.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Quantity */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {totalUnits} units
                    </td>

                    {/* 7. Value */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(totalVal, 2)}
                    </td>

                    {/* 8. Source */}
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]" title={ord.source}>
                      {ord.source || 'Central Warehouse'}
                    </td>

                    {/* 9. Destination */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={ord.destination}>
                      {ord.destination || 'Main Street Store'}
                    </td>

                    {/* 10. Priority */}
                    <td className="py-3 px-3 text-center">
                      {getPriorityBadge(ord.priority)}
                    </td>

                    {/* 11. Status */}
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(ord.status, ord.isAtRisk)}
                    </td>

                    {/* 12. Expected Date */}
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {ord.expectedDate || '11 Sep'}
                    </td>

                    {/* 13. Action (Sticky Right) */}
                    <td
                      className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-slate-900 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectOrder(ord)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View Order Details"
                        aria-label={`View order ${ord.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No orders found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your status, priority, or search filters above.
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
