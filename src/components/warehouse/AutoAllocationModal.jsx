import React, { useMemo, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { allocateOrderItem } from '../../services/orderService';

export default function AutoAllocationModal({
  isOpen,
  eligibleItems = [],
  onClose,
  onAutoAllocationConfirmed,
}) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute proposed allocation based on priority rules & available stock pool
  const previewPlan = useMemo(() => {
    if (!eligibleItems || eligibleItems.length === 0) return [];

    // Sort items by Priority (Critical > High > Normal > Low), then earliest expected date, then createdAt
    const priorityRank = { critical: 4, high: 3, normal: 2, low: 1 };

    const sorted = [...eligibleItems].sort((a, b) => {
      const rA = priorityRank[(a.priority || '').toLowerCase()] || 0;
      const rB = priorityRank[(b.priority || '').toLowerCase()] || 0;
      if (rB !== rA) return rB - rA;

      const dateA = new Date(a.expectedDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.expectedDate || b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    // Track available stock per SKU dynamically so stock is never allocated twice
    const availablePool = new Map();
    sorted.forEach((it) => {
      if (!availablePool.has(it.sku)) {
        availablePool.set(it.sku, it.warehouseStock || 0);
      }
    });

    return sorted.map((it) => {
      const remainingRequired = Math.max(0, it.required - (it.allocated || 0));
      const currentStockInPool = availablePool.get(it.sku) || 0;

      // Allocate what's available
      const proposed = Math.min(remainingRequired, currentStockInPool);
      availablePool.set(it.sku, Math.max(0, currentStockInPool - proposed));

      const remainingAfterProposed = Math.max(0, remainingRequired - proposed);
      let resultStatus = 'Fully Allocated';
      if (proposed === 0) {
        resultStatus = 'Shortfall / Out of Stock';
      } else if (remainingAfterProposed > 0) {
        resultStatus = 'Partially Allocated';
      }

      return {
        ...it,
        remainingRequired,
        currentStockInPool,
        proposed,
        shortfall: remainingAfterProposed,
        resultStatus,
      };
    });
  }, [eligibleItems]);

  if (!isOpen) return null;

  const totalProposedUnits = previewPlan.reduce((sum, p) => sum + p.proposed, 0);
  const totalShortfallUnits = previewPlan.reduce((sum, p) => sum + p.shortfall, 0);
  const eligibleOrdersCount = new Set(previewPlan.filter((p) => p.proposed > 0).map((p) => p.orderId)).size;

  const handleConfirmPlan = async () => {
    if (totalProposedUnits === 0) {
      toast.error('No Units Allocatable', 'Current warehouse inventory is depleted for selected orders.');
      return;
    }

    setConfirming(true);
    try {
      // Execute each proposed allocation
      for (const plan of previewPlan) {
        if (plan.proposed > 0) {
          await allocateOrderItem(plan.orderId, plan.sku, plan.proposed);
        }
      }

      toast.success(
        'Auto Allocation Confirmed',
        `✓ ${totalProposedUnits} units successfully allocated across ${eligibleOrdersCount} orders.`
      );

      if (onAutoAllocationConfirmed) {
        onAutoAllocationConfirmed();
      }
      onClose();
    } catch {
      toast.error('Allocation Failed', 'Error executing auto-allocation.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
              AUTOMATED WAREHOUSE ALLOCATION
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Auto Allocation Preview
            </h2>
            <p className="text-xs text-slate-500">
              Allocates inventory by Priority (Critical → High → Normal → Low) and earliest expected delivery date.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Orders to Allocate
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {eligibleOrdersCount} orders
              </span>
              <span className="text-[10px] text-slate-500">From {previewPlan.length} line items</span>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                Proposed Allocation
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
                {totalProposedUnits} units
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Reserved from Central Warehouse
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
                Unallocated Shortfall
              </span>
              <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5 block">
                {totalShortfallUnits} units
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                Requires warehouse replenishment
              </span>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Remaining Req</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Proposed Allocation</th>
                  <th className="py-2.5 px-3 text-right">Shortfall</th>
                  <th className="py-2.5 px-3 text-center">Proposed Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewPlan.map((p, idx) => (
                  <tr key={`${p.orderId}-${p.sku}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {p.orderId}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{p.product}</div>
                      <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.priority === 'Critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : p.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {p.remainingRequired}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {p.currentStockInPool}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      +{p.proposed}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={p.shortfall > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                        {p.shortfall}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.resultStatus === 'Fully Allocated'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : p.resultStatus === 'Partially Allocated'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {p.resultStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmPlan}
            disabled={confirming || totalProposedUnits === 0}
            className="px-5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {confirming ? 'Allocating…' : `Confirm Auto Allocation (${totalProposedUnits} units)`}
          </button>
        </div>
      </div>
    </div>
  );
}
