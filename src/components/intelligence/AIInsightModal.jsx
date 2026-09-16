import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, AlertTriangle, ExternalLink, Activity, Package, Layers } from 'lucide-react';
import Modal from '../common/Modal';

export default function AIInsightModal({ isOpen, onClose, insight, onExecuteAction }) {
  const navigate = useNavigate();
  if (!insight) return null;

  const isCrit = insight.priority === 'Critical';
  const isHigh = insight.priority === 'High';

  const priorityBadgeClass = isCrit
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
    : isHigh
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={insight.title} maxWidth="max-w-2xl">
      <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${priorityBadgeClass}`}>
              {insight.priority} Priority
            </span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold">
              {insight.category}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              {insight.source}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              {insight.detectedTime || insight.time || 'Recent'}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
              {insight.confidence}% Conf.
            </span>
          </div>
        </div>

        {/* Analytical Reasoning */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-wide uppercase">
            Intelligence Analysis & Context
          </h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {insight.explanation}
          </p>
          {insight.reasoning && (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] italic px-1">
              <strong>Operational Reasoning:</strong> {insight.reasoning}
            </p>
          )}
        </div>

        {/* Supporting Telemetry */}
        {insight.metrics && insight.metrics.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-wide uppercase">
              Supporting Operational Telemetry
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {insight.metrics.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase truncate">{m.label}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Impact */}
        {insight.impact && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-300 block text-[11px] font-bold uppercase tracking-wider">
                Operational & Financial Impact
              </strong>
              <p className="text-amber-950 dark:text-amber-200/90 text-xs mt-0.5 font-medium">
                {insight.impact}
              </p>
            </div>
          </div>
        )}

        {/* Recommended Prescriptive Action */}
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Prescriptive Recommendation</span>
          </div>
          <p className="text-emerald-950 dark:text-emerald-200 text-xs font-medium leading-relaxed">
            {insight.recommendedAction}
          </p>
        </div>

        {/* Related Product info */}
        {insight.sku && insight.sku !== 'N/A' && (
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{insight.product}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold">
                {insight.sku}
              </span>
            </div>
            {insight.relatedPath && (
              <button
                onClick={() => {
                  onClose();
                  navigate(insight.relatedPath);
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{insight.relatedModuleName || 'View Module'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              if (onExecuteAction) onExecuteAction(insight);
              onClose();
              if (insight.relatedPath) navigate(insight.relatedPath);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Take Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
