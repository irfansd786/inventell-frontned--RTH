import React from 'react';
import Card from '../common/Card';
import { Users, UserPlus, UserMinus, Activity, Clock, AlertTriangle } from 'lucide-react';

export default function MonitoringStats({ stats }) {
  const statCards = [
    { label: 'People in Store', value: stats.peopleInStore, icon: Users, color: 'emerald' },
    { label: 'Entry Count', value: stats.entryCount, icon: UserPlus, color: 'emerald' },
    { label: 'Exit Count', value: stats.exitCount, icon: UserMinus, color: 'amber' },
    { label: 'Current Occupancy', value: `${stats.occupancyPercent}%`, icon: Activity, color: 'purple' },
    { label: 'Average Dwell Time', value: stats.avgDwellTime, icon: Clock, color: 'sky' },
    { label: 'Queue Length', value: stats.queueLength, icon: AlertTriangle, color: 'rose' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 truncate">{s.label}</span>
              <div className="p-1.5 bg-slate-100 rounded-md text-slate-700">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}
