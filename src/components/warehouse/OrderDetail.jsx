import React, { useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  Package,
  Building2,
  Store,
  Truck,
  ShieldCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { transitionOrder } from '../../services/orderService';

export default function OrderDetail({
  order,
  onClose,
  onOrderUpdated,
  onOpenCreateReplenish = null,
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const orderId = order.id || 'ORD-0000';
  const status = order.status || 'Pending';
  const priority = order.priority || 'Normal';
  const dateLabel = order.dateLabel || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '09 Sep 2026');
  const source = order.source || 'Central Warehouse';
  const destination = order.destination || 'Main Street Store';
  const orderType = order.type || 'Replenishment';
  const expectedDate = order.expectedDate || '11 Sep 2026';
  const items = order.items || [];

  const totalProducts = items.length;
  const totalUnits = items.reduce((sum, it) => sum + (it.requested || 0), 0);
  const totalValue = items.reduce(
    (sum, it) => sum + (it.subtotal || (it.requested || 0) * (it.unitPrice || 0)),
    0
  );

  // Fulfillment stages sequence
  const STAGES = [
    { key: 'Draft', label: 'Draft Created' },
    { key: 'Pending', label: 'Order Pending' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Allocated', label: 'Allocated' },
    { key: 'Picking', label: 'Picking' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Dispatched', label: 'Dispatched' },
    { key: 'Delivered', label: 'Delivered' },
  ];

  // Map status to active stage index
  const getStageIndex = (st) => {
    switch ((st || '').toLowerCase()) {
      case 'draft':
        return 0;
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'allocated':
        return 3;
      case 'picking':
        return 4;
      case 'packed':
        return 5;
      case 'dispatched':
        return 6;
      case 'delivered':
        return 7;
      case 'at risk':
        return 2; // At risk during or prior to fulfillment
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const activeStageIdx = getStageIndex(status);

  // Real Inventory Validation across line items
  const inventoryValidation = useMemo(() => {
    const shortfalls = [];
    items.forEach((it) => {
      const required = it.requested || 0;
      const availableWh = it.warehouseStock !== undefined ? it.warehouseStock : 50;
      const availableStore = it.storeStock !== undefined ? it.storeStock : 0;
      if (required > availableWh) {
        shortfalls.push({
          sku: it.sku,
          product: it.product,
          required,
          available: availableWh,
          shortfall: required - availableWh,
          storeStock: availableStore,
        });
      }
    });

    return {
      isValid: shortfalls.length === 0,
      shortfalls,
      totalShortfallUnits: shortfalls.reduce((sum, s) => sum + s.shortfall, 0),
    };
  }, [items]);

  // Next Recommended Action Logic
  const getNextActionConfig = () => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          action: 'confirm',
          nextStatus: 'Confirmed',
          label: 'Confirm Order',
          instruction: 'Verify line items and submit order for warehouse allocation.',
          variant: 'primary',
        };
      case 'pending':
        return {
          action: 'confirm',
          nextStatus: 'Confirmed',
          label: 'Confirm Order',
          instruction: 'Review quantities and approve order for inventory allocation.',
          variant: 'primary',
        };
      case 'confirmed':
        return {
          action: 'allocate',
          nextStatus: 'Allocated',
          label: 'Allocate Inventory',
          instruction: inventoryValidation.isValid
            ? 'Reserve stock from Central Warehouse to fulfill order lines.'
            : 'Warning: Shortfall detected. Review warehouse reserves before allocating.',
          disabled: !inventoryValidation.isValid,
          variant: 'primary',
        };
      case 'allocated':
        return {
          action: 'start-picking',
          nextStatus: 'Picking',
          label: 'Start Picking',
          instruction: 'Generate warehouse picklist and assign to floor picker.',
          variant: 'primary',
        };
      case 'picking':
        return {
          action: 'complete-picking',
          nextStatus: 'Packed',
          label: 'Complete Picking & Pack',
          instruction: 'Confirm all line items picked and move order to packing bay.',
          variant: 'primary',
        };
      case 'packed':
        return {
          action: 'dispatch',
          nextStatus: 'Dispatched',
          label: 'Dispatch Order',
          instruction: 'Manifest order onto delivery vehicle and initiate dispatch tracking.',
          variant: 'primary',
        };
      case 'dispatched':
        return {
          action: 'deliver',
          nextStatus: 'Delivered',
          label: 'Mark as Delivered',
          instruction: 'Confirm physical receipt and check-in at store inventory dock.',
          variant: 'primary',
        };
      case 'delivered':
        return {
          action: null,
          label: 'Order Fulfilled',
          instruction: 'Order has been successfully delivered and added to store inventory.',
          variant: 'disabled',
        };
      case 'at risk':
        return {
          action: 'resolve-risk',
          label: 'Resolve Shortfall',
          instruction: order.riskAction || 'Review supplier purchase orders or transfer inventory.',
          variant: 'amber',
        };
      case 'cancelled':
        return {
          action: null,
          label: 'Order Cancelled',
          instruction: 'No further fulfillment actions permitted for cancelled orders.',
          variant: 'disabled',
        };
      default:
        return {
          action: 'confirm',
          label: 'Process Order',
          instruction: 'Proceed to next fulfillment stage.',
          variant: 'primary',
        };
    }
  };

  const nextAction = getNextActionConfig();

  const handleExecuteAction = async () => {
    if (!nextAction.action) return;

    if (nextAction.action === 'resolve-risk') {
      if (onOpenCreateReplenish) {
        onClose();
        onOpenCreateReplenish(items[0] || null);
      } else {
        toast.info('Risk Resolution', 'Review warehouse transfers or create supplier replenishment.');
      }
      return;
    }

    try {
      const res = await transitionOrder(order.id, nextAction.action);
      toast.success('Status Updated', `Order ${order.id} transitioned to "${nextAction.nextStatus}".`);
      if (onOrderUpdated) {
        onOrderUpdated({ ...order, status: nextAction.nextStatus });
      }
      onClose();
    } catch {
      toast.error('Transition Failed', 'Could not update order status.');
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
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                ORDER DETAILS
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {orderId}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  status === 'Dispatched' || status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : status === 'At Risk'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : status === 'Cancelled'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {status}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  priority === 'Critical'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300'
                    : priority === 'High'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {priority} Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Created: {dateLabel} • Expected Fulfillment: {expectedDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. ORDER SUMMARY GRID */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Order Summary
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Order Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{orderType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Source Bay</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={source}>
                  {source}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Destination</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={destination}>
                  {destination}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Expected Delivery</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{expectedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Line Items</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{totalProducts} SKUs</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Units</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{totalUnits} units</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[10px] block">Calculated Value (INR)</span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {formatINR(totalValue, 2)}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Notes: </span>
                {order.notes}
              </div>
            )}
          </div>

          {/* 2. INVENTORY VALIDATION BANNER */}
          {!inventoryValidation.isValid ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>INSUFFICIENT STOCK — Shortfall Detected ({inventoryValidation.totalShortfallUnits} units)</span>
              </div>
              <div className="space-y-1 text-[11px] pl-5">
                {inventoryValidation.shortfalls.map((s) => (
                  <p key={s.sku}>
                    • <strong>{s.product}</strong>: Required {s.required} pcs, but Central Warehouse has only{' '}
                    {s.available} pcs (Shortfall: {s.shortfall} pcs). Store stock: {s.storeStock} pcs.
                  </p>
                ))}
              </div>
              <p className="text-[10px] text-amber-800 dark:text-amber-300 pl-5 font-medium">
                Recommended Action: Create supplier replenishment or adjust order allocation before releasing to picking floor.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inventory Validated: All {totalUnits} units available in warehouse reserves</span>
              </div>
              <span className="font-mono text-[10px] font-semibold opacity-80">Ready for Allocation</span>
            </div>
          )}

          {/* 3. PRODUCTS LINE ITEMS TABLE */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Products Breakdown
            </span>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Barcode</th>
                    <th className="py-2.5 px-3 text-right">Requested</th>
                    <th className="py-2.5 px-3 text-right">Allocated</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it, idx) => {
                    const hasShort = (it.requested || 0) > (it.warehouseStock !== undefined ? it.warehouseStock : 999);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          <div>{it.product}</div>
                          {hasShort && (
                            <span className="text-[10px] font-bold text-red-600 block">
                              Shortfall: {it.requested - (it.warehouseStock || 0)} pcs (WH: {it.warehouseStock || 0})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{it.sku}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">{it.barcode || '—'}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {it.requested}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {it.allocated || 0}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatINR(it.unitPrice || 0, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(it.subtotal || (it.requested || 0) * (it.unitPrice || 0), 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. FULFILLMENT PROGRESS TIMELINE */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fulfillment Progression Timeline
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
              {STAGES.map((stg, idx) => {
                const isPassed = activeStageIdx >= 0 && idx < activeStageIdx;
                const isCurrent = activeStageIdx >= 0 && idx === activeStageIdx;
                return (
                  <div key={stg.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-2 ring-slate-400 dark:ring-slate-600'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] leading-tight ${
                        isCurrent
                          ? 'font-bold text-slate-900 dark:text-white'
                          : isPassed
                          ? 'font-medium text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {stg.label}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                      {isPassed || isCurrent ? (idx === 0 ? 'Logged' : 'Completed') : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. NEXT RECOMMENDED ACTION */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Next Recommended Action:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{nextAction.label}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {nextAction.instruction}
              </p>
            </div>

            {nextAction.action && (
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={nextAction.disabled}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {nextAction.label}
              </button>
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>

          {!inventoryValidation.isValid && onOpenCreateReplenish && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateReplenish(inventoryValidation.shortfalls[0] || null);
              }}
              className="px-4 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Replenish Shortfall
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
