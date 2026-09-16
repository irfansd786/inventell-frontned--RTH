import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import SectionCard from './SectionCard';
import { useNavigate } from 'react-router-dom';

export default function AIBusinessInsights({ recommendations = [] }) {
  const navigate = useNavigate();

  const decisionFlowSteps = [
    { label: 'Customer Analytics', detail: 'High Beverage Dwell' },
    { label: 'Sales Impact', detail: '+45% Beverage Revenue' },
    { label: 'Inventory Level', detail: 'Store Stock < 15 pcs' },
    { label: 'LightGBM Forecast', detail: '7-Day Demand Spike' },
    { label: 'Risk Engine', detail: 'Replenishment Deficit' },
    { label: 'Recommended Action', detail: 'Warehouse Transfer' },
  ];

  return (
    <SectionCard
      icon={Sparkles}
      title="AI BUSINESS INSIGHTS & DECISION ENGINE"
      subtitle="Structured analytical facts translated into actionable retail operational recommendations"
      className="h-full"
      source="INVINTELL Intelligence Engine"
    >
      <div className="space-y-4">
        {/* End-to-End Decision System Pipeline */}
        <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-2 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              INVINTELL Decision Flow Pipeline
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              End-to-End Intelligence
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center pt-1">
            {decisionFlowSteps.map((step, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Step {idx + 1}
                </span>
                <span className="text-[11px] font-extrabold text-white leading-tight my-1">
                  {step.label}
                </span>
                <span className="text-[9px] text-blue-300 font-mono font-medium truncate">
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Business Recommendations */}
        <div className="space-y-3">
          {(recommendations.length > 0
            ? recommendations
            : [
                {
                  action: 'Schedule Pre-Peak Counter Staffing',
                  impact: 'Reduces peak checkout wait time by ~42% during 17:00–19:00 evening window.',
                  rationale:
                    'Customer traffic consistently peaks between 16:00 and 20:00. Opening counter #3 30 minutes before peak prevents checkout queue accumulation.',
                  priority: 'High',
                },
                {
                  action: 'Replenish Fast-Moving Beverages',
                  impact: 'Safeguards ₹14,500 expected revenue ahead of festive demand spike.',
                  rationale:
                    'High customer dwell in Beverages (+48% over store average) correlates with sales velocity. Stock is approaching reorder threshold.',
                  priority: 'Urgent',
                },
              ]
          ).map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {rec.action}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
                  }`}
                >
                  {rec.priority || 'Action Required'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {rec.rationale || rec.reason}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">
                  Impact: <strong className="text-slate-800 dark:text-slate-200">{rec.impact}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/inventory/low-stock')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <span>Execute in Decision Center</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
