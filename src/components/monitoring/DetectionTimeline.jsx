import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Clock, UserPlus, UserMinus, AlertTriangle } from 'lucide-react';

export default function DetectionTimeline({ events }) {
  return (
    <Card title="Detection Event Timeline" subtitle="Real-time event stream extracted by vision AI">
      <div className="space-y-3">
        {events.map((evt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-lg text-xs hover:bg-white hover:shadow-2xs transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-md ${
                  evt.type === 'Entry'
                    ? 'bg-emerald-100 text-emerald-700'
                    : evt.type === 'Exit'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {evt.type === 'Entry' ? (
                  <UserPlus className="w-3.5 h-3.5" />
                ) : evt.type === 'Exit' ? (
                  <UserMinus className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800">{evt.id}</span>
                <span className="text-slate-500 ml-2">({evt.zone})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={
                  evt.type === 'Entry'
                    ? 'emerald'
                    : evt.type === 'Exit'
                    ? 'amber'
                    : 'rose'
                }
                size="sm"
              >
                {evt.type}
              </Badge>
              <span className="font-mono text-[10px] text-slate-400 font-semibold">{evt.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
