import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Boxes, MapPin, UserCheck, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { pickOrderItem, markOrderPicked } from '../../services/orderService';
import { getBinLocation } from '../../utils/warehouseUtils';

export default function PickingDetailModal({
  isOpen,
  order,
  onClose,
  onPickingUpdated,
  onOpenException,
}) {
  const { toast } = useToast();
  const [pickQuantities, setPickQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const initial = {};
      (order.items || []).forEach((it) => {
        initial[it.sku] = Number(it.picked || 0);
      });
      setPickQuantities(initial);
    }
  }, [isOpen, order]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const items = order.items || [];
  const totalAllocated = items.reduce((sum, it) => sum + (it.allocated || it.requested || 0), 0);
  const currentTotalPicked = items.reduce(
    (sum, it) => sum + Number(pickQuantities[it.sku] !== undefined ? pickQuantities[it.sku] : it.picked || 0),
    0
  );
  const totalRemaining = Math.max(0, totalAllocated - currentTotalPicked);
  const progressPct = totalAllocated > 0 ? Math.min(100, Math.round((currentTotalPicked / totalAllocated) * 100)) : 100;
  const isAllPicked = totalRemaining === 0 && totalAllocated > 0;

  const handleQtyChange = (sku, newQty, maxAllocated) => {
    const val = Math.max(0, Math.min(maxAllocated, Number(newQty) || 0));
    setPickQuantities((prev) => ({ ...prev, [sku]: val }));
  };

  const handleConfirmQuantities = async () => {
    setSaving(true);
    try {
      for (const it of items) {
        const qty = pickQuantities[it.sku] !== undefined ? pickQuantities[it.sku] : it.picked || 0;
        await pickOrderItem(order.id, it.sku, qty);
      }

      if (isAllPicked) {
        toast.success(
          'Picking Completed',
          `✓ All ${currentTotalPicked} units picked for ${order.id}. Order moved to Ready for Packing.`
        );
      } else {
        toast.info(
          'Picking Progress Saved',
          `✓ ${currentTotalPicked} of ${totalAllocated} units recorded for ${order.id}.`
        );
      }

      if (onPickingUpdated) onPickingUpdated();
      onClose();
    } catch {
      toast.error('Picking Error', 'Failed to save pick counts.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllPicked = async () => {
    setSaving(true);
    try {
      await markOrderPicked(order.id);
      toast.success(
        'Order Fully Picked',
        `✓ All ${totalAllocated} units marked as picked for ${order.id}. Ready for Packing.`
      );
      if (onPickingUpdated) onPickingUpdated();
      onClose();
    } catch {
      toast.error('Picking Error', 'Unable to complete picking task.');
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
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
              FLOOR PICK TASK • {order.id}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Destination: {order.destination || 'Main Street Store'}
              </h2>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Picker: {order.picker || 'Ramesh K.'}
              </span>
            </div>
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Order Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Unique Products</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {items.length} Products
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Allocated to Pick</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {totalAllocated} Units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Picked So Far</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {currentTotalPicked} Units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Remaining</span>
              <span
                className={`font-mono font-bold text-sm ${
                  totalRemaining > 0 ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                {totalRemaining} Units
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Pick Progress: {currentTotalPicked} / {totalAllocated} Units Picked
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {progressPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Pick List Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Allocated</th>
                  <th className="py-2.5 px-3 text-center w-36">Picked Units</th>
                  <th className="py-2.5 px-3 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it) => {
                  const maxAlloc = it.allocated || it.requested || 0;
                  const currentPicked =
                    pickQuantities[it.sku] !== undefined ? pickQuantities[it.sku] : it.picked || 0;
                  const remaining = Math.max(0, maxAlloc - currentPicked);
                  const location = getBinLocation(it.sku);

                  return (
                    <tr key={it.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="truncate max-w-[180px]" title={it.product || it.name}>
                          {it.product || it.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {it.sku} • {it.barcode}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{location}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {maxAlloc}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(it.sku, currentPicked - 1, maxAlloc)}
                            className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={maxAlloc}
                            value={currentPicked}
                            onChange={(e) => handleQtyChange(it.sku, e.target.value, maxAlloc)}
                            className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(it.sku, currentPicked + 1, maxAlloc)}
                            className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            remaining === 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {remaining}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenException) onOpenException(order);
            }}
            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold text-red-700 dark:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Exception</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmQuantities}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Partial Pick'}
            </button>

            <button
              type="button"
              onClick={handleMarkAllPicked}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Picked ({totalAllocated} Units)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
