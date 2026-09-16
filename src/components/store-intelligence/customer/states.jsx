// Shared data-state primitives: empty states + skeletons.
// Every analytics section renders one of loading / success / empty / error.

import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ message, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-4' : 'py-8'} px-4`}>
      <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        <Inbox className="w-4 h-4" />
      </span>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5 max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3" aria-label="Loading metrics">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-3" />
          <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SectionSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2.5 animate-pulse" aria-label="Loading section">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            <div className="h-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
