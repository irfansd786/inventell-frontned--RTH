import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Info, Package, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';

export default function RiskModal({ isOpen, onClose, risk, onResolve }) {
  const navigate = useNavigate();
  if (!risk) return null;

  const isCritical = risk.scoreLevel === 'Critical';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={risk.riskName} maxWidth="max-w-2xl">
      <div className="space-y-5 text-xs text-slate-700">
        {/* Header Risk Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              isCritical ? 'bg-red-600' : risk.scoreLevel === 'High' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{risk.category}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isCritical ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800'
                }`}>
                  {risk.scoreLevel} Priority
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Detected: {risk.detectedAt} • ID: {risk.id}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">{risk.riskScore}<span className="text-xs text-slate-400 font-normal">/100</span></div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Risk Score</p>
          </div>
        </div>

        {/* Description & Impact */}
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Detection Reason & Impact</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{risk.description}</p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Probability: <strong className="text-white">{risk.probability}</strong></span>
            <span>Business Impact: <strong className="text-emerald-400">{risk.impact}</strong></span>
          </div>
        </div>

        {/* Supporting Metrics */}
        {risk.metrics && (
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs">Supporting Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(risk.metrics).map(([key, val], idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-medium">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action Box */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recommended AI Action</span>
          </div>
          <p className="text-emerald-950 font-medium">{risk.recommendedAction}</p>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {risk.productId && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/inventory');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-slate-500" />
                View Inventory
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                navigate(risk.relatedModule || '/dashboard');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Open Module
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onResolve) onResolve(risk.id);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => {
                onClose();
                const target = (risk.relatedModule === '/transfers' ? '/allocation' : risk.relatedModule) || '/allocation';
                navigate(target);
              }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {risk.actionButtonText || 'Take Action'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
