import React from 'react';
import Card from '../common/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function ZoneAnalyticsCard({ zones }) {
  return (
    <Card title="Zone Analytics" subtitle="Traffic breakdown by store section">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-2.5 font-semibold">Zone</th>
              <th className="pb-2.5 font-semibold">Visitors</th>
              <th className="pb-2.5 font-semibold">Avg Dwell</th>
              <th className="pb-2.5 font-semibold">Traffic Share</th>
              <th className="pb-2.5 font-semibold text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(zones || []).map((zone) => {
              const trendStr = typeof zone.trend === 'string' ? zone.trend : '';
              const isUp = trendStr.startsWith('+');
              const isNeutral = !trendStr || trendStr === '0%' || trendStr === '—';

              return (
                <tr key={zone.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-800">{zone.name}</td>
                  <td className="py-2.5 font-medium text-slate-600">{zone.visitors}</td>
                  <td className="py-2.5 font-medium text-slate-600">{zone.dwellTime}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: zone.traffic }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 text-[11px]">{zone.traffic}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span
                      className={`inline-flex items-center text-[11px] ${
                        isNeutral
                          ? 'text-slate-400'
                          : isUp
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {isNeutral ? (
                        <Minus className="w-3 h-3 mr-0.5" />
                      ) : isUp ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {zone.trend}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
