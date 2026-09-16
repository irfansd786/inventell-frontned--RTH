import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { allocateOrderItem } from '../../services/orderService';

export default function AllocationDetailModal({
  isOpen,
  itemData,
  onClose,
  onAllocationConfirmed,
}) {
  const { toast } = useToast();

  const orderId = itemData?.orderId || 'ORD-0000';
  const sku = itemData?.sku || 'SKU-000';
  const productName = itemData?.product || 'Product Name Unavailable';
  const barcode = itemData?.barcode || 'Barcode unavailable';
  const required = Number(itemData?.required ?? itemData?.requested ?? 0);
  const alreadyAllocated = Number(itemData?.allocated ?? 0);
  const remainingRequired = Math.max(0, required - alreadyAllocated);
  const availableToAllocate = Number(itemData?.warehouseStock ?? itemData?.available ?? 0);
  const currentStoreStock = Number(itemData?.storeStock ?? 0);

  // Default quantity to allocate = min(remainingRequired, availableToAllocate)
  const defaultAlloc = Math.max(0, Math.min(remainingRequired, availableToAllocate));
  const [allocQty, setAllocQty] = useState(defaultAlloc);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAllocQty(defaultAlloc);
    }
  }, [isOpen, defaultAlloc]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !itemData) return null;

  const numAlloc = Number(allocQty) || 0;
  const isOverAllocating = numAlloc > availableToAllocate;
  const isExceedingRequirement = numAlloc > remainingRequired;
  const isInvalid = numAlloc <= 0 || isOverAllocating || isExceedingRequirement;

  const projectedRemainingStock = Math.max(0, availableToAllocate - numAlloc);
  const remainingAfterAlloc = Math.max(0, remainingRequired - numAlloc);

  const handleConfirm = async () => {
    if (isInvalid) {
      toast.error('Invalid Quantity', 'Please enter an allocation quantity within available stock.');
      return;
    }

    setSaving(true);
    try {
      const result = await allocateOrderItem(orderId, sku, numAlloc);
      if (result) {
        if (remainingAfterAlloc === 0) {
          toast.success('Allocation Complete', `✓ ${numAlloc} units allocated successfully to ${orderId}.`);
        } else {
          toast.info(
            'Partial Allocation',
            `✓ ${numAlloc} units allocated. ${remainingAfterAlloc} units remain unallocated.`
          );
        }

        if (onAllocationConfirmed) {
          onAllocationConfirmed({
            orderId,
            sku,
            allocatedQty: numAlloc,
            updatedOrder: result.order,
          });
        }
        onClose();
      }
    } catch {
      toast.error('Allocation Error', 'Unable to record inventory allocation.');
    } finally {
      setSaving(false);
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
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
              ALLOCATE INVENTORY
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{orderId}</span>
              <span className="text-slate-400">•</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                {productName}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              SKU: {sku} • Barcode: {barcode}
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

        {/* ================= MODAL BODY ================= */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. ORDER REQUIREMENT */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Requirement
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-[10px] text-slate-400 block uppercase">Required</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {required} pcs
                </span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-[10px] text-slate-400 block uppercase">Already Allocated</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {alreadyAllocated} pcs
                </span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-[10px] text-slate-400 block uppercase">Remaining Required</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {remainingRequired} pcs
                </span>
              </div>
            </div>
          </div>

          {/* 2. INVENTORY AVAILABILITY */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Central Warehouse Inventory Availability
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Store Stock</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {currentStoreStock} pcs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Warehouse Reserve</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {availableToAllocate} pcs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Reserved Stock</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {alreadyAllocated} pcs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Projected Balance</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {projectedRemainingStock} pcs
                </span>
              </div>
            </div>
          </div>

          {/* 3. ALLOCATION INPUT */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Quantity to Allocate
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Maximum Allocatable: {Math.min(remainingRequired, availableToAllocate)} units
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllocQty((prev) => Math.max(1, Number(prev) - 10))}
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setAllocQty((prev) => Math.max(1, Number(prev) - 1))}
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                -1
              </button>

              <input
                type="number"
                min="1"
                max={Math.min(remainingRequired, availableToAllocate)}
                value={allocQty}
                onChange={(e) => setAllocQty(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-mono font-black text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setAllocQty((prev) =>
                    Math.min(Math.min(remainingRequired, availableToAllocate), Number(prev) + 1)
                  )
                }
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() =>
                  setAllocQty((prev) =>
                    Math.min(Math.min(remainingRequired, availableToAllocate), Number(prev) + 10)
                  )
                }
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                +10
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                After Allocation:{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {projectedRemainingStock} units
                </strong>{' '}
                remaining in warehouse
              </span>
              <span>
                Unallocated Requirement:{' '}
                <strong
                  className={`font-mono ${
                    remainingAfterAlloc > 0 ? 'text-amber-600 font-bold' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {remainingAfterAlloc} units
                </strong>
              </span>
            </div>
          </div>

          {/* 4. VALIDATION MESSAGE */}
          {isOverAllocating ? (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Allocation exceeds available inventory ({availableToAllocate} units available).</span>
            </div>
          ) : isExceedingRequirement ? (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Allocation exceeds remaining order requirement ({remainingRequired} units needed).</span>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Inventory available in Central Warehouse. Ready to confirm allocation.
              </span>
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
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
            onClick={handleConfirm}
            disabled={saving || isInvalid}
            className="px-5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {saving ? 'Confirming…' : 'Confirm Allocation'}
          </button>
        </div>
      </div>
    </div>
  );
}
