import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { saveQueueSettings } from '../../../services/queueService';

export default function QueueThresholdModal({
  isOpen,
  onClose,
  currentThresholds,
  onSaved,
}) {
  const { toast } = useToast();
  const [alertThreshold, setAlertThreshold] = useState(6);
  const [normalMax, setNormalMax] = useState(3);
  const [moderateMax, setModerateMax] = useState(6);
  const [highMax, setHighMax] = useState(10);
  const [criticalThreshold, setCriticalThreshold] = useState(11);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentThresholds) {
      setAlertThreshold(currentThresholds.alert_threshold ?? 6);
      setNormalMax(currentThresholds.normal_max ?? 3);
      setModerateMax(currentThresholds.moderate_max ?? 6);
      setHighMax(currentThresholds.high_max ?? 10);
      setCriticalThreshold(currentThresholds.critical_threshold ?? 11);
    }
  }, [currentThresholds]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        alert_threshold: Number(alertThreshold),
        threshold_normal_max: Number(normalMax),
        threshold_moderate_max: Number(moderateMax),
        threshold_high_max: Number(highMax),
        critical_threshold: Number(criticalThreshold),
      };
      await saveQueueSettings(payload);
      toast.success('Thresholds Updated', `Operational queue threshold set to ${alertThreshold} people.`);
      onSaved?.(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save queue thresholds:', err);
      toast.error('Error', 'Unable to persist threshold configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setAlertThreshold(6);
    setNormalMax(3);
    setModerateMax(6);
    setHighMax(10);
    setCriticalThreshold(11);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Configure Queue Thresholds
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Operational alert thresholds for CCTV queue detection
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            {/* 1. Primary Alert Threshold */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
              <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                Queue Alert Trigger Threshold (Persons)
              </label>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                Triggers HIGH Queue Alert and Navbar notification when waiting count reaches this number.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-base font-black text-blue-700 dark:text-blue-300 w-8 text-right font-mono">
                  {alertThreshold}
                </span>
              </div>
            </div>

            {/* Queue States Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Dynamic Queue States:
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    NORMAL (0 – {normalMax})
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">SLA compliant flow</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                    MODERATE ({normalMax + 1} – {moderateMax})
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Monitoring advisory</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                    HIGH ({moderateMax + 1} – {highMax})
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Counter expansion</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                    CRITICAL ({highMax + 1}+)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Urgent staff deploy</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Apply Thresholds'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}