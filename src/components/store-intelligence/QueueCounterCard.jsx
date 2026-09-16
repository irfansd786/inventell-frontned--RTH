import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Users, Clock, ShoppingBag } from 'lucide-react';

export default function QueueCounterCard({ counter, onClick }) {
  const isHigh = counter.status === 'HIGH';
  const isMed = counter.status === 'MEDIUM';

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
        isHigh
          ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
          : isMed
          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-800">{counter.name}</h4>
        <Badge
          variant={isHigh ? 'rose' : isMed ? 'amber' : 'emerald'}
          size="sm"
          dot
        >
          {counter.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Users className="w-3.5 h-3.5 text-slate-400" /> People Waiting
          </div>
          <p className="text-xl font-black text-slate-900">{counter.peopleWaiting}</p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Est. Wait Time
          </div>
          <p className="text-xl font-black text-slate-900">{counter.waitTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Transactions: <strong>{counter.transactions}</strong></span>
        <span>Avg Service: <strong>{counter.avgServiceTime}</strong></span>
      </div>
    </div>
  );
}
