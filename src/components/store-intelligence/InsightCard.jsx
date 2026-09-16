import React from 'react';
import Card from '../common/Card';
import { Sparkles, TrendingUp, Info } from 'lucide-react';

export default function InsightCard({ title = 'Analytical Insights', insights = [] }) {
  return (
    <Card
      title={title}
      subtitle="Automated cross-domain observations and spatial findings"
      action={
        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
          <Sparkles className="w-4 h-4" />
        </div>
      }
    >
      <div className="space-y-2.5">
        {(insights || []).map((insight) => (
          <div
            key={insight.id}
            className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 hover:bg-white transition-all shadow-2xs"
          >
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {insight.title && <p className="font-bold text-slate-800">{insight.title}</p>}
              <p>{insight.text || insight.description || ''}</p>
              {insight.impact && <p className="text-[11px] text-slate-500 mt-1">{insight.impact}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
