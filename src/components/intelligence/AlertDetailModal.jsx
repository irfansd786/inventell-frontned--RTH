import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import Modal from '../common/Modal';

export default function AlertDetailModal({ isOpen, onClose, alert, onResolve }) {
  const navigate = useNavigate();
  if (!alert) return null;

  const isCrit = alert.severity === 'Critical';
  const isHigh = alert.severity === 'High';
  const isResolved = alert.status === 'Resolved';

  const severityBadgeClass = isCrit
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
    : isHigh
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={alert.title} maxWidth="max-w-xl">
      <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${severityBadgeClass}`}>
              {alert.severity}
            </span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold">
              {alert.category}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {alert.detectedTime || alert.time || 'Recent'}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              isResolved
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            }`}>
              {alert.status}
            </span>
          </div>
        </div>

        {/* Source & Location */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Detection Source & Station</span>
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {alert.source || 'Central System Telemetry'}
          </p>
        </div>

        {/* Telemetry vs Threshold Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Current Value
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {alert.currentValue || 'Condition Triggered'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Configured Threshold
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {alert.threshold || 'Operational Limit'}
            </span>
          </div>
        </div>

        {/* Description & Impact */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Alert Context & Description
          </h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {alert.description || alert.message}
          </p>
        </div>

        {/* Operational Impact */}
        {alert.impact && (
          <div className="p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-900 dark:text-red-300 block text-[11px] font-bold uppercase tracking-wider">
                Operational Impact
              </strong>
              <p className="text-red-950 dark:text-red-200/90 text-xs mt-0.5 font-medium">
                {alert.impact}
              </p>
            </div>
          </div>
        )}

        {/* Recommended Operational Response */}
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Recommended Response</span>
          </div>
          <p className="text-emerald-950 dark:text-emerald-200 text-xs font-medium leading-relaxed">
            {alert.recommendedResponse}
          </p>
        </div>

        {/* Related SKU info if available */}
        {alert.sku && alert.sku !== 'N/A' && (
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Catalog Reference:</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold">
                {alert.sku}
              </span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isResolved && (
              <button
                onClick={() => {
                  onResolve(alert.id);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}

            {alert.relatedModule && (
              <button
                onClick={() => {
                  onClose();
                  navigate(alert.relatedModule);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>View Related Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
