import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { MapPin, Users, Clock, Zap, Activity } from 'lucide-react';

export default function ZoneDetail({ zone }) {
  if (!zone) return null;

  return (
    <Card
      title={`Zone Focus: ${zone.name}`}
      subtitle="Selected zone detailed performance & traffic telemetry"
      action={
        <Badge variant={zone.status === 'High' ? 'rose' : 'amber'} size="sm" dot>
          {zone.status} Activity
        </Badge>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">Zone Visitors</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{zone.visitors}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">Average Dwell</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{zone.dwellTime}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-medium">Traffic Share</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{zone.trafficShare}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-medium">Peak Hour</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{zone.peakTime}</p>
        </div>
      </div>
    </Card>
  );
}
