import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { AlertCircle, Clock, Bell } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  const severityBadges = {
    high: 'red',
    medium: 'amber',
    low: 'emerald',
  };

  return (
    <Card
      title="Store Alerts"
      subtitle="Real-time automated incident queue"
      action={
        <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full">
          {alerts.length} Active
        </span>
      }
    >
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  alert.severity === 'high'
                    ? 'bg-red-50 text-red-600'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{alert.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{alert.location}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <Badge variant={severityBadges[alert.severity] || 'neutral'} size="sm">
                {String(alert.severity || 'info').toUpperCase()}
              </Badge>
              <span className="text-[10px] text-slate-400 font-medium">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
