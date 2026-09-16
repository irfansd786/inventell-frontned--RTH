// Traffic-to-Sales Correlation — CCTV traffic panel + sales activity
// panel + the backend's cautious relationship note. Never a conversion
// rate: no visitor-to-transaction linkage exists.

import React from 'react';
import { Scale } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

export default function TrafficSalesCorrelation({ correlation, onViewDetails }) {
  return (
    <SectionCard
      icon={Scale}
      title="Traffic-to-Sales Correlation"
      subtitle="Correlation between customer traffic and sales activity"
      className="h-full"
      source="CCTV Tracking · Sales Dataset"
      action={
        onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
          >
            View Details →
          </button>
        )
      }
    >
      {!correlation ? (
        <EmptyState compact message="Insufficient data to calculate correlation." />
      ) : (
        <div className="space-y-2 flex flex-col justify-between h-full">
          {/* Formula banner */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
            <span>CCTV Traffic</span>
            <span>+</span>
            <span>Sales Activity</span>
            <span>=</span>
            <span className="text-blue-600 dark:text-blue-400">Correlation</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Visitors
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {correlation.linked_zone_visitors}
                <span className="ml-1 text-[10px] font-normal text-slate-500 dark:text-slate-400">in {correlation.linked_zone}</span>
              </p>
            </div>

            <div className="rounded-md bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sales
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                ₹{Number(correlation.top_category_revenue).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {correlation.top_category} · {correlation.top_category_bills} bills
              </p>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              Correlation
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {correlation.note}
            </p>
          </div>

          <div className="rounded-md border border-slate-100 dark:border-slate-800/80 p-1.5 text-xs bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between mt-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Linkage Scope
            </span>
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              Directional · Departmental Footfall
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300">
              CCTV Footfall
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              POS Dataset
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
