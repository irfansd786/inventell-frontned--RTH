import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { ArrowUpRight, ArrowDownRight, Minus, Eye } from 'lucide-react';

export default function ZoneTable({ zones, selectedZoneId, onSelectZone }) {
  return (
    <Card title="Zone Performance Table" subtitle="Click any zone row to view detailed telemetry">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Zone Name</th>
              <th className="pb-3 font-semibold">Visitors</th>
              <th className="pb-3 font-semibold">Avg Dwell</th>
              <th className="pb-3 font-semibold">Traffic Share</th>
              <th className="pb-3 font-semibold">Peak Time</th>
              <th className="pb-3 font-semibold">Trend</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(zones || []).map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const trendStr = typeof zone.trend === 'string' ? zone.trend : '';
              const isUp = trendStr.startsWith('+');
              const isNeutral = !trendStr || trendStr === '0%' || trendStr === '—';

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                      }`}
                    />
                    {zone.name}
                  </td>
                  <td className="py-3 font-semibold text-slate-700">{zone.visitors}</td>
                  <td className="py-3 text-slate-600">{zone.dwellTime}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: typeof zone.trafficShare === 'number' ? `${zone.trafficShare}%` : zone.trafficShare || '0%' }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 text-[11px]">{zone.trafficShare || '0%'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 font-mono text-[11px]">{zone.peakTime}</td>
                  <td className="py-3 font-bold">
                    <span
                      className={`inline-flex items-center text-[11px] ${
                        isNeutral ? 'text-slate-400' : isUp ? 'text-emerald-600' : 'text-red-600'
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
                  <td className="py-3 text-right">
                    <Badge
                      variant={
                        zone.status === 'High'
                          ? 'red'
                          : zone.status === 'Medium'
                          ? 'amber'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {zone.status} Activity
                    </Badge>
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
