import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  UserPlus,
  DoorOpen,
  Check,
  Camera,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { recordQueueAlertAction } from '../../../services/queueService';

export default function QueueAlertModal({
  isOpen,
  onClose,
  alertData,
  onActionComplete,
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !alertData) return null;

  const currentQueue = alertData.currentQueue ?? alertData.queue_length ?? 0;
  const threshold = alertData.threshold ?? alertData.queue_threshold ?? 6;
  const averageWait = alertData.averageWait ?? alertData.averageWaitTime ?? alertData.average_wait_time ?? '00:00';
  const growthRate = alertData.trend ?? alertData.growthRate ?? alertData.growth_rate ?? alertData.queueGrowth ?? 'Increasing';
  const camera = alertData.camera ?? alertData.camera_id ?? 'Camera 01';
  const confidence = alertData.confidence ?? (alertData.detectionConfidence ? `${Math.round(alertData.detectionConfidence * 100)}%` : '89%');
  const recommendation = alertData.recommendation || 'Open an additional checkout counter';
  const reason = alertData.reason || 'Queue has exceeded the configured threshold and continues to grow.';
  const severity = (alertData.severity || 'HIGH').toUpperCase();
  const alertId = alertData.id || alertData.alert_id || 0;

  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';

  const handleAction = async (actionType) => {
    setSubmitting(true);
    try {
      const res = await recordQueueAlertAction(alertId, actionType, `Manager approved ${actionType} at checkout`);
      const actionLabels = {
        open_counter: 'Open additional checkout counter approved',
        assign_staff: 'Auxiliary staff deployment dispatched',
        dismiss: 'Alert dismissed by store manager',
      };
      const label = actionLabels[actionType] || 'Queue action recorded';
      toast.success('Queue Action Recorded', `✓ ${label}`);
      onActionComplete?.(actionType, res);
      onClose();
    } catch (e) {
      console.error('Error recording queue alert action:', e);
      toast.error('Action Failed', 'Unable to record operational action to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between ${
              isCritical || isHigh
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  isCritical || isHigh
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Queue Alert
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      isCritical || isHigh
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {severity} SEVERITY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {camera} • Operational Checkout SLA Threshold Exceeded
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* KPI Fact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Fact 1: Current Queue */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Current Queue</span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {currentQueue}{' '}
                  <span className="text-[11px] font-normal text-slate-400">people</span>
                </div>
              </div>

              {/* Fact 2: Threshold */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Threshold</span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {threshold}{' '}
                  <span className="text-[11px] font-normal text-slate-400">people</span>
                </div>
              </div>

              {/* Fact 3: Average Wait */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Average Wait</span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {averageWait}
                </div>
              </div>

              {/* Fact 4: Trend */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Trend</span>
                </div>
                <div className="text-sm font-bold text-red-600 dark:text-red-400 capitalize mt-1 truncate">
                  {growthRate}
                </div>
              </div>
            </div>

            {/* AI Recommendation Section */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-slate-800 dark:to-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  AI Recommendation
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {recommendation}
              </p>

              <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  Reason:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>

            {/* Telemetry Metadata Provenance */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" /> Source: {camera}
              </span>
              <span>Detection Confidence: {confidence}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* 1. Open Counter */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('open_counter')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition shadow-xs disabled:opacity-50"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Open Counter</span>
              </button>

              {/* 2. Assign Staff */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('assign_staff')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition shadow-xs disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Staff</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* 3. Dismiss */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('dismiss')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Dismiss
              </button>

              {/* 4. Close */}
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}