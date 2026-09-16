import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Truck, Check, Clock, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { dispatchOrder } from '../../services/orderService';
import { getOrderProductSummary } from '../../utils/warehouseUtils';

export default function DispatchDetailModal({
  isOpen,
  order,
  onClose,
  onDispatchConfirmed,
  onOpenException,
}) {
  const { toast } = useToast();
  const [carrier, setCarrier] = useState('Dedicated Fleet - Van #3');
  const [vehicleNumber, setVehicleNumber] = useState('KA-01-E-4421');
  const [driverName, setDriverName] = useState('K. Ramanathan');
  const [dockDoor, setDockDoor] = useState('Dock Bay 4');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setCarrier(order.carrier || 'Dedicated Fleet - Van #3');
      setVehicleNumber(order.vehicleNumber || 'KA-01-E-4421');
      setDriverName(order.driverName || 'K. Ramanathan');
      setDockDoor(order.dockDoor || 'Dock Bay 4');
      setTrackingNumber(order.trackingNumber || `TRK-2026-${Math.floor(1000 + Math.random() * 9000)}`);
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
  const prodSummary = getOrderProductSummary(order);
  const totalRequired = items.reduce((s, it) => s + (it.requested || 0), 0);
  const totalAllocated = items.reduce((s, it) => s + (it.allocated || 0), 0);
  const totalPicked = items.reduce((s, it) => s + (it.picked || 0), 0);
  const totalPacked = items.reduce(
    (s, it) => s + Number(it.packed !== undefined ? it.packed : (['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(order.status) ? it.picked : 0)),
    0
  );

  // Dispatch Validation: Order cannot be dispatched until Allocation completed AND Required quantities picked AND Required quantities packed
  const unallocatedCount = Math.max(0, totalRequired - totalAllocated);
  const unpickedCount = Math.max(0, totalRequired - totalPicked);
  const unpackedCount = Math.max(0, totalRequired - totalPacked);

  const isBlocked =
    order.status !== 'Dispatched' &&
    order.status !== 'Delivered' &&
    (unallocatedCount > 0 || unpickedCount > 0 || unpackedCount > 0);

  let blockedReason = '';
  if (unallocatedCount > 0) {
    blockedReason = `${unallocatedCount} units have not been allocated from Central Warehouse stock.`;
  } else if (unpickedCount > 0) {
    blockedReason = `${unpickedCount} units have not been picked on the picking floor.`;
  } else if (unpackedCount > 0) {
    blockedReason = `${unpackedCount} units are not packed into cartons.`;
  }

  const isAlreadyDispatched = order.status === 'Dispatched' || order.status === 'Delivered';

  const handleConfirmDispatch = async () => {
    if (isBlocked) {
      toast.error('Dispatch Blocked', `Cannot dispatch order: ${blockedReason}`);
      return;
    }

    setSaving(true);
    try {
      await dispatchOrder(order.id, {
        carrier,
        vehicleNumber,
        driverName,
        dockDoor,
        trackingNumber,
      });

      toast.success(
        'Shipment Dispatched',
        `✓ Order ${order.id} released to ${carrier} (${vehicleNumber}) for delivery to ${order.destination}.`
      );

      if (onDispatchConfirmed) onDispatchConfirmed();
      onClose();
    } catch (err) {
      toast.error('Dispatch Failed', err.message || 'Unable to confirm dispatch release.');
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
              DISPATCH DOCK MANIFEST • {order.id}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Destination: {order.destination || 'Main Street Store'}
              </h2>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Priority: {order.priority || 'Normal'}
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
                {prodSummary.uniqueProducts} Products
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Total Units</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {totalRequired} Units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Package Count</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {order.packageCount || 2} Cartons
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Expected Date</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {order.expectedDate || '11 Sep 2026'}
              </span>
            </div>
          </div>

          {/* Validation Banner */}
          {isBlocked ? (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Dispatch Blocked</span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 pl-6">
                Reason: {blockedReason}
              </p>
            </div>
          ) : isAlreadyDispatched ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Order has already been dispatched. Tracking Number:{' '}
                <strong className="font-mono">{order.trackingNumber || 'TRK-2026-9021'}</strong>
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                ✓ All {totalPacked} units verified, packed, and sealed. Ready for dock release and vehicle departure.
              </span>
            </div>
          )}

          {/* Fulfillment Timeline */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fulfillment Workflow Lifecycle
            </span>

            <div className="flex items-center justify-between text-[11px] font-medium pt-1">
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Order Created</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Allocated</span>
              </div>
              <span className="text-slate-400">→</span>
              <div
                className={`flex items-center gap-1 ${
                  totalPicked >= totalRequired
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-600'
                }`}
              >
                {totalPicked >= totalRequired ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>Picked</span>
              </div>
              <span className="text-slate-400">→</span>
              <div
                className={`flex items-center gap-1 ${
                  totalPacked >= totalRequired
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-600'
                }`}
              >
                {totalPacked >= totalRequired ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>Packed</span>
              </div>
              <span className="text-slate-400">→</span>
              <div
                className={`flex items-center gap-1 font-bold ${
                  isAlreadyDispatched
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : !isBlocked
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400'
                }`}
              >
                {isAlreadyDispatched ? <Check className="w-3.5 h-3.5" /> : <span>●</span>}
                <span>Dispatched</span>
              </div>
            </div>
          </div>

          {/* Carrier & Loading Dock Information Form */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Carrier Assignment & Dock Door Verification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Carrier / Fleet Method
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={isAlreadyDispatched}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
                >
                  <option value="Dedicated Fleet - Van #3">Dedicated Fleet - Van #3</option>
                  <option value="Cold Express Logistics">Cold Express Logistics (Chilled)</option>
                  <option value="QuickRoute Logistics">QuickRoute Logistics (Direct)</option>
                  <option value="Central Distribution Carrier">Central Distribution Carrier</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  disabled={isAlreadyDispatched}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Driver Name & Contact
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  disabled={isAlreadyDispatched}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Dock Loading Door
                </label>
                <select
                  value={dockDoor}
                  onChange={(e) => setDockDoor(e.target.value)}
                  disabled={isAlreadyDispatched}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
                >
                  <option value="Dock Bay 1">Dock Bay 1 (Express)</option>
                  <option value="Dock Bay 2">Dock Bay 2 (General)</option>
                  <option value="Dock Bay 3">Dock Bay 3 (Chilled)</option>
                  <option value="Dock Bay 4">Dock Bay 4 (Main Street Route)</option>
                </select>
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
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>

            {!isAlreadyDispatched && (
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={saving || isBlocked}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{saving ? 'Releasing…' : 'Dispatch Order'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
