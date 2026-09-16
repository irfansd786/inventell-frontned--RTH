import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { reportOrderException } from '../../services/orderService';

const DEFAULT_REASONS = {
  Picking: [
    'Missing Item in Warehouse Aisle / Bin',
    'Damaged SKU in Storage Bay',
    'Barcode Mismatch on Physical Shelf',
    'Insufficient Physical Count vs System Stock',
  ],
  Packing: [
    'Damaged Item During Packing',
    'Weight Discrepancy Exceeds Tolerance',
    'Packaging Material Shortage (Carton Box B2)',
    'Container Seal Failure',
  ],
  Dispatch: [
    'Carrier Transport Vehicle Delay',
    'Loading Dock Bay Congestion',
    'Manifest / Shipping Label Mismatch',
    'Driver Clearance Hold',
  ],
  Allocation: [
    'Warehouse Stock Deficiency / Stockout',
    'Batch Expiry Date Discrepancy',
    'Physical Storage Bay Inaccessible',
  ],
};

export default function ReportExceptionModal({
  isOpen,
  order,
  stage = 'Picking',
  onClose,
  onExceptionReported,
}) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [severity, setSeverity] = useState('High');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const reasons = DEFAULT_REASONS[stage] || DEFAULT_REASONS.Picking;
      setReason(reasons[0]);
      setCustomReason('');
      setSeverity('High');
      setRecommendedAction(
        stage === 'Picking'
          ? 'Re-assign picker to alternate aisle bay or raise replenishment purchase order.'
          : stage === 'Packing'
          ? 'Quarantine damaged units and request replacement pick from Central Warehouse.'
          : 'Re-route via reserve carrier fleet or notify receiving retail store supervisor.'
      );
    }
  }, [isOpen, stage]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast.error('Missing Reason', 'Please specify the exception reason.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await reportOrderException(order.id, stage, finalReason, {
        severity,
        recommendedAction,
      });

      toast.success(
        'Exception Recorded',
        `Exception reported for ${order.id}. Order flagged for supervisor intervention.`
      );

      if (onExceptionReported) {
        onExceptionReported(result);
      }
      onClose();
    } catch {
      toast.error('Submission Failed', 'Unable to record operational exception.');
    } finally {
      setSubmitting(false);
    }
  };

  const presetReasons = DEFAULT_REASONS[stage] || DEFAULT_REASONS.Picking;

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
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-red-50/70 dark:bg-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-red-700 dark:text-red-300 uppercase block">
                LOG OPERATIONAL EXCEPTION
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {stage} Disruption • {order.id}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Order Summary banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Order Destination</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {order.destination || 'Main Street Store'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Order Scale</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {order.items?.length || 1} Products • {order.totalUnits || 0} Units
              </span>
            </div>
          </div>

          {/* Exception Reason */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px]">
              Exception Category / Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
            >
              {presetReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Other">Other / Custom Issue</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px]">
                Specific Description
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe specific floor disruption..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Severity */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px]">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-colors cursor-pointer ${
                    severity === lvl
                      ? lvl === 'Critical'
                        ? 'bg-red-600 text-white border-red-700'
                        : lvl === 'High'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : lvl === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                        : 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px]">
              Recommended Operational Action
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="What should warehouse floor supervisor do next?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{submitting ? 'Recording…' : 'Flag Exception'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
