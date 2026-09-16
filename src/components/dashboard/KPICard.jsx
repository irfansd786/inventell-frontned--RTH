import React from 'react';
import {
  Users,
  Activity,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  Bell,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card from '../common/Card';

const iconMap = {
  Users,
  Activity,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  Bell,
};

export default function KPICard({ data }) {
  const Icon = iconMap[data?.iconName] || Activity;
  const changeStr = typeof data?.change === 'string' ? data.change : '';
  const isUp = changeStr.startsWith('+');

  return (
    <Card className="hover:border-slate-300 hover:shadow-md transition-all duration-200" padding={false}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {data.title}
          </span>
          <div className="p-2 bg-slate-100/80 rounded-lg text-slate-700">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {data.value}
          </span>
          
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              data.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/50 dark:border-red-800/60'
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {data.change}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          {data.subtitle}
        </p>
      </div>
    </Card>
  );
}
