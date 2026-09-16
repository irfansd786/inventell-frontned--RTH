import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No data available',
  description = 'There is currently no information to display for this section.',
  icon: Icon = PackageOpen,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      <div className="p-3 bg-white rounded-full shadow-xs border border-slate-100 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}
