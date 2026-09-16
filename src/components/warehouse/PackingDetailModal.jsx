import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { packOrderItem, markOrderPacked } from '../../services/orderService';

export default function PackingDetailModal({
  isOpen,
  order,
  onClose,
  onPackingUpdated,
  onOpenException,
}) {
  const { toast } = useToast();
  const [packQuantities, setPackQuantities] = useState({});
  const [packageCount, setPackageCount] = useState(2);
  const [boxType, setBoxType] = useState('Corrugated Carton B2');
  const [sealNumber, setSealNumber] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const initial = {};
      (order.items || []).forEach((it) => {
        initial[it.sku] = Number(it.packed !== undefined ? it.packed : it.picked || 0);
      });
      setPackQuantities(initial);
      setPackageCount(order.packageCount || Math.max(1, Math.ceil((order.totalUnits || 50) / 40)));
      setBoxType(order.boxType || 'Corrugated Carton B2');
      setSealNumber(order.sealNumber || `SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setValidationError(null);
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
  const totalPicked = items.reduce((sum, it) => sum + Number(it.picked || it.allocated || 0), 0);
  const currentTotalPacked = items.reduce(
    (sum, it) => sum + Number(packQuantities[it.sku] !== undefined ? packQuantities[it.sku] : it.packed || 0),
    0
  );
  const totalRemaining = Math.max(0, totalPicked - currentTotalPacked);
  const progressPct = totalPicked > 0 ? Math.min(100, Math.round((currentTotalPacked / totalPicked) * 100)) : 100;
  const isAllPacked = totalRemaining === 0 && totalPicked > 0;

  const handleQtyChange = (sku, newQty, maxPicked, productName) => {
    const val = Number(newQty);
    if (val > maxPicked) {
      setValidationError(
        `Cannot pack ${val} units of ${productName}. Only ${maxPicked} units have been picked.`
      );
    } else {
      setValidationError(null);
    }
    const safeVal = Math.max(0, Math.min(maxPicked, val || 0));
    setPackQuantities((prev) => ({ ...prev, [sku]: safeVal }));
  };

  const handleConfirmQuantities = async () => {
    if (validationError) {
      toast.error('Validation Error', validationError);
      return;
    }

    setSaving(true);
    try {
      for (const it of items) {
        const qty = packQuantities[it.sku] !== undefined ? packQuantities[it.sku] : it.packed || 0;
        await packOrderItem(order.id, it.sku, qty, {
          packageCount,
          boxType,
        });
      }

      if (isAllPacked) {
        toast.success(
          'Packing Completed',
          `✓ All ${currentTotalPacked} units packed into ${packageCount} cartons for ${order.id}. Ready for Dispatch.`
        );
      } else {
        toast.info(
          'Packing Progress Saved',
          `✓ ${currentTotalPacked} of ${totalPicked} units packed for ${order.id}.`
        );
      }

      if (onPackingUpdated) onPackingUpdated();
      onClose();
    } catch {
      toast.error('Packing Error', 'Unable to record packed quantities.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllPacked = async () => {
    setSaving(true);
    try {
      await markOrderPacked(order.id, {
        packageCount,
        boxType,
        sealNumber,
      });
      toast.success(
        'Order Packed & Sealed',
        `✓ All ${totalPicked} units packed into ${packageCount} cartons (${sealNumber}) for ${order.id}. Ready for Dispatch.`
      );
      if (onPackingUpdated) onPackingUpdated();
      onClose();
    } catch {
      toast.error('Packing Error', 'Failed to seal package.');
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
              PACKING STATION TASK • {order.id}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Destination: {order.destination || 'Main Street Store'}
              </h2>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Packer: {order.packer || 'Sunita P.'}
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
              <span className="text-[10px] text-slate-400 uppercase block">Picked to Pack</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {totalPicked} Units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Packed</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {currentTotalPacked} Units
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

          {/* Validation Warning Callout */}
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Packing Progress: {currentTotalPacked} / {totalPicked} Units Packed
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

          {/* Packing Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3 text-right">Picked</th>
                  <th className="py-2.5 px-3 text-center w-36">Packed Units</th>
                  <th className="py-2.5 px-3 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it) => {
                  const maxPicked = it.picked || it.allocated || 0;
                  const currentPacked =
                    packQuantities[it.sku] !== undefined ? packQuantities[it.sku] : it.packed || 0;
                  const remaining = Math.max(0, maxPicked - currentPacked);

                  return (
                    <tr key={it.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="truncate max-w-[220px]" title={it.product || it.name}>
                          {it.product || it.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {it.sku} • {it.barcode}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {maxPicked}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleQtyChange(it.sku, currentPacked - 1, maxPicked, it.product || it.name)
                            }
                            className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={maxPicked}
                            value={currentPacked}
                            onChange={(e) =>
                              handleQtyChange(it.sku, e.target.value, maxPicked, it.product || it.name)
                            }
                            className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQtyChange(it.sku, currentPacked + 1, maxPicked, it.product || it.name)
                            }
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

          {/* Package Information Card */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Package & Shipping Manifest Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Package / Box Count
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={packageCount}
                    onChange={(e) => setPackageCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 font-semibold">Boxes</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Container Spec
                </label>
                <select
                  value={boxType}
                  onChange={(e) => setBoxType(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="Corrugated Carton B2">Corrugated Carton B2 (Standard)</option>
                  <option value="Heavy Duty C1 Box">Heavy Duty C1 Box (Large)</option>
                  <option value="Insulated Cold Box D3">Insulated Cold Box D3 (Dairy/Chilled)</option>
                  <option value="Reinforced Tote T1">Reinforced Tote T1 (Reusable)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Security Seal #
                </label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="e.g. SEAL-892102"
                  className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                />
              </div>
            </div>
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
              disabled={saving || Boolean(validationError)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Partial Pack'}
            </button>

            <button
              type="button"
              onClick={handleMarkAllPacked}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Packed ({totalPicked} Units)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
