import React from 'react';
import Card from '../common/Card';
import { Camera, Cpu, Database, Sparkles, Activity } from 'lucide-react';
import { SYSTEM_STATUS } from '../../utils/constants';

export default function SystemActivity({ activities }) {
  return (
    <Card title="System & Activity" subtitle="Real-time health status and event stream">
      {/* System Status Indicators */}
      <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Cameras</p>
            <p className="text-xs font-bold text-slate-800">{SYSTEM_STATUS.cameras}</p>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Processing</p>
            <p className="text-xs font-bold text-slate-800">{SYSTEM_STATUS.processing}</p>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Database</p>
            <p className="text-xs font-bold text-slate-800">{SYSTEM_STATUS.database}</p>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Models</p>
            <p className="text-xs font-bold text-slate-800">{SYSTEM_STATUS.aiModels}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Recent Activity
        </h4>
        <div className="space-y-2.5">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700">{act.text}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
